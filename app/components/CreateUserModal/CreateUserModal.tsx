"use client";
import { useState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { CreateUserPayload } from "@/app/admin/settings/types";

interface CreateUserModalProps {
  isOpen: boolean;
  creating: boolean;
  onClose: () => void;
  onCreate: (payload: CreateUserPayload) => Promise<boolean> | boolean;
}

export function CreateUserModal({
  isOpen,
  creating,
  onClose,
  onCreate,
}: CreateUserModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("mesero");

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      setFullName("");
      setRole("mesero");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onCreate({
      email,
      password,
      full_name: fullName,
      role,
    });
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="text-primary w-5 h-5" />
            <h3 className="text-base font-bold text-foreground">
              Crear Nuevo Miembro
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Ej. Carlos Pérez"
              className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="carlos@restaurant.com"
              className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Contraseña Temporal
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Rol Inicial
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-background border border-border text-foreground text-xs font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-primary cursor-pointer">
              <option value="admin">Administrador</option>
              <option value="cashier">Cajero</option>
              <option value="chef">Chef</option>
              <option value="mesero">Mesero</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface/80 text-foreground text-xs font-bold transition cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider transition shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer">
              {creating ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
