"use client";
import { useState, useEffect } from "react";
import { User, Phone, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { supabase } from "@/app/lib/supabase";

interface CustomerSelectorProps {
  restaurantId: number | string;
  onCustomerSelect: (
    customerId: string | null,
    customerData: { name: string; phone: string; notes: string } | null,
  ) => void;
}

export default function CustomerSelector({
  restaurantId,
  onCustomerSelect,
}: CustomerSelectorProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  // Buscar cliente al cambiar el teléfono (con un pequeño debounce o al perder el foco)
  const handlePhoneBlur = async () => {
    if (!phone || phone.length < 7) return;
    setSearching(true);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("phone", phone)
      .single();

    if (data) {
      // El cliente ya existe: cargamos sus datos y notas
      setExistingCustomer(data);
      setName(data.name);
      setNotes(data.notes || "");
      onCustomerSelect(data.id, {
        name: data.name,
        phone: data.phone,
        notes: data.notes,
      });
    } else {
      // Cliente nuevo
      setExistingCustomer(null);
      onCustomerSelect(null, { name, phone, notes });
    }
    setSearching(false);
  };

  // Actualizar datos hacia el componente padre cuando el usuario escribe nombre o notas
  const handleDataChange = (newName: string, newNotes: string) => {
    setName(newName);
    setNotes(newNotes);
    // Nota: El ID real se creará o actualizará al momento de guardar el pedido
    onCustomerSelect(existingCustomer?.id || null, {
      name: newName,
      phone,
      notes: newNotes,
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
          <User className="w-4 h-4" /> Información del Cliente
        </h3>
        {existingCustomer && (
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Cliente Frecuente
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teléfono (Clave de búsqueda) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Teléfono / WhatsApp
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="tel"
              placeholder="Ej: 3001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={handlePhoneBlur}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-medium"
            />
          </div>
        </div>

        {/* Nombre del Cliente */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nombre del Cliente
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => handleDataChange(e.target.value, notes)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* Observaciones y Preferencias con Alerta Visual si ya existen */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>Observaciones / Preferencias (Memoria del Cliente)</span>
          {existingCustomer && (
            <span className="text-amber-400 text-[9px]">
              ⚠️ Cargadas del historial
            </span>
          )}
        </label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <textarea
            rows={2}
            placeholder="Ej: Alérgico a la cebolla, prefiere borde de queso, pide la salsa aparte..."
            value={notes}
            onChange={(e) => handleDataChange(name, e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-medium resize-none"
          />
        </div>
      </div>
    </div>
  );
}
