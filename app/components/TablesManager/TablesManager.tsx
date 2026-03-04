"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Plus,
  Users,
  Clock,
  Trash2,
  AlertCircle,
  X,
  Store,
  ChevronRight,
} from "lucide-react";

/**
 * QRPido Tables Manager - DARK MODE EDITION
 * Implementación robusta con carga dinámica de Supabase para compatibilidad en Preview.
 */

export default function TablesManager() {
  const [supabase, setSupabase] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // 1. Carga dinámica de Supabase
  useEffect(() => {
    const loadSupabase = async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error("Faltan las credenciales de Supabase");
        }

        const client = createClient(supabaseUrl, supabaseAnonKey);
        setSupabase(client);
      } catch (err) {
        console.error("Error cargando Supabase:", err);
      }
    };
    loadSupabase();
  }, []);

  // 2. Validación de Sesión y obtención del Restaurant ID
  useEffect(() => {
    if (!supabase) return;

    const getSessionAndRestaurant = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      setUser(session.user);

      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", session.user.id)
        .maybeSingle();

      if (restaurant) {
        setRestaurantId(restaurant.id);
      } else {
        setLoading(false);
      }
    };
    getSessionAndRestaurant();
  }, [supabase]);

  const fetchInitialData = async () => {
    setLoading(true);

    // Cargar Mesas
    const { data: tablesData } = await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("number", { ascending: true });

    if (tablesData) setTables(tablesData);

    // Cargar Órdenes activas
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .neq("state", "completado");

    if (ordersData) setActiveOrders(ordersData);
    setLoading(false);
  };

  // 3. Suscripción Realtime y Carga de Datos
  useEffect(() => {
    if (!supabase || !restaurantId) return;

    fetchInitialData();

    const channel = supabase
      .channel("table-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tables",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => fetchInitialData(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => fetchInitialData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, restaurantId]);

  // 4. Lógica de Estado de Mesa
  const getTableMetrics = (tableId: string) => {
    const tableOrders = activeOrders.filter((o) => o.table_id === tableId);
    const isOccupied = tableOrders.length > 0;
    const totalAmount = tableOrders.reduce(
      (acc, curr) => acc + (curr.total_price || 0),
      0,
    );

    return {
      isOccupied,
      orderCount: tableOrders.length,
      totalAmount,
    };
  };

  // 5. Acciones CRUD
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber || !restaurantId || !supabase) return;

    const { error } = await supabase.from("tables").insert([
      {
        number: parseInt(newTableNumber),
        restaurant_id: restaurantId,
      },
    ]);

    if (!error) {
      setNewTableNumber("");
      setIsDrawerOpen(false);

      // 🔥 RECARGA MANUAL: Refrescamos la lista de mesas inmediatamente
      if (typeof fetchInitialData === "function") {
        await fetchInitialData();
      }
    } else {
      console.error("Error creando mesa:", error.message);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm("¿Eliminar esta mesa permanentemente?") || !supabase) return;

    const { error } = await supabase.from("tables").delete().eq("id", id);

    if (error) console.error("Error al eliminar la mesa.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-blue-400 font-bold animate-pulse">
          Sincronizando Salón...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-slate-950 p-6 md:p-10 text-slate-200 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-blue-600 p-4 rounded-[1.5rem] shadow-2xl shadow-blue-900/20">
            <LayoutDashboard className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Mapa de Mesas
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Monitoreo en Vivo
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95">
          <Plus size={22} />
          NUEVA MESA
        </button>
      </div>

      {/* Grid de Mesas */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {tables.map((table) => {
          const metrics = getTableMetrics(table.id);
          return (
            <div
              key={table.id}
              className={`group relative bg-[#1E293B] rounded-[2.5rem] p-8 transition-all duration-500 border-2 ${
                metrics.isOccupied
                  ? "border-blue-500 ring-4 ring-blue-500/10 shadow-2xl translate-y-[-4px]"
                  : "border-slate-800 shadow-sm hover:border-slate-700"
              }`}>
              <div className="flex justify-between items-start mb-8">
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-black transition-all duration-500 ${
                    metrics.isOccupied
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-[#0F172A] text-slate-600 border border-slate-800"
                  }`}>
                  {table.number}
                </div>
                <button
                  onClick={() => handleDeleteTable(table.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all transform hover:scale-110">
                  <Trash2 size={22} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${metrics.isOccupied ? "bg-green-500 animate-pulse" : "bg-slate-700"}`}></div>
                  <span
                    className={`text-[11px] font-black uppercase tracking-[0.2em] ${metrics.isOccupied ? "text-green-400" : "text-slate-500"}`}>
                    {metrics.isOccupied ? "Mesa Activa" : "Mesa Libre"}
                  </span>
                </div>

                {metrics.isOccupied ? (
                  <div className="pt-5 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />{" "}
                        {metrics.orderCount} Pedidos
                      </span>
                      <span className="text-xl font-black text-white">
                        ${metrics.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-3 flex items-center gap-1">
                      <Clock size={12} /> Actividad reciente
                    </p>
                  </div>
                ) : (
                  <div className="pt-5 border-t border-slate-800">
                    <p className="text-xs text-slate-600 font-medium italic">
                      Sin comanda abierta
                    </p>
                  </div>
                )}
              </div>

              {metrics.isOccupied && (
                <button className="w-full mt-8 bg-[#0F172A] text-blue-400 font-black py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 group/btn border border-slate-800">
                  Ver Detalles
                  <ChevronRight
                    size={16}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </button>
              )}
            </div>
          );
        })}

        {!loading && tables.length === 0 && (
          <div className="col-span-full bg-[#1E293B] rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-800">
            <div className="bg-[#0F172A] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
              <Store className="text-slate-700 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-white">
              Salón sin configurar
            </h3>
            <p className="text-slate-500 font-medium mt-2">
              Registra tus mesas para empezar a recibir pedidos.
            </p>
          </div>
        )}
      </div>

      {/* Slide-over Drawer Dark */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#1E293B] h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-800">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black italic tracking-tighter text-white">
                Nueva <span className="text-blue-500">Mesa</span>
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-3 hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-8">
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block">
                  Identificador numérico
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="0"
                  className="w-full p-6 bg-[#0F172A] rounded-[1.5rem] outline-none border-2 border-slate-800 focus:border-blue-600 focus:bg-[#0F172A] text-white text-3xl font-black transition-all placeholder:text-slate-800"
                />
                <p className="text-[11px] text-slate-600 mt-4 font-medium leading-relaxed">
                  Este número servirá para generar el QR único y gestionar las
                  comandas en cocina.
                </p>
              </div>

              <div className="flex gap-4 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-5 rounded-2xl font-bold text-slate-500 hover:bg-slate-800 transition-all">
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-500 shadow-xl shadow-blue-900/20 transition-all">
                  GUARDAR CAMBIOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
