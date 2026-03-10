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
  Receipt,
  UtensilsCrossed,
} from "lucide-react";

/**
 * QRPido Tables Manager - DARK MODE EDITION
 * Versión optimizada con Drawer inteligente y visualización de pedidos en tiempo real.
 */

export default function TablesManager() {
  const [supabase, setSupabase] = useState<any>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de UI
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "view">("create");
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newTableNumber, setNewTableNumber] = useState("");
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // 1. Carga dinámica de Supabase para compatibilidad en Preview
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
    if (!supabase || !restaurantId) return;

    // Cargamos mesas y órdenes (incluyendo items para el detalle)
    const [tablesRes, ordersRes] = await Promise.all([
      supabase
        .from("tables")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("number", { ascending: true }),
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("restaurant_id", restaurantId)
        .neq("state", "completado"),
    ]);

    if (tablesRes.data) setTables(tablesRes.data);
    if (ordersRes.data) setActiveOrders(ordersRes.data);
    setLoading(false);
  };

  // 3. Suscripción Realtime
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

  // 4. Lógica de Interfaz y Métricas
  const getTableMetrics = (tableId: string) => {
    const tableOrders = activeOrders.filter((o) => o.table_id === tableId);
    const isOccupied = tableOrders.length > 0;
    const totalAmount = tableOrders.reduce(
      (acc, curr) => acc + (curr.total_price || 0),
      0,
    );

    return { isOccupied, orderCount: tableOrders.length, totalAmount };
  };

  const handleOpenDetails = (table: any) => {
    setSelectedTable(table);
    setDrawerMode("view");
    setIsDeleting(false);
    setIsDrawerOpen(true);
  };

  const handleOpenCreate = () => {
    setDrawerMode("create");
    setNewTableNumber("");
    setIsDrawerOpen(true);
  };

  // 5. Acciones CRUD
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber || !restaurantId || !supabase) return;

    const { error } = await supabase
      .from("tables")
      .insert([
        { number: parseInt(newTableNumber), restaurant_id: restaurantId },
      ]);

    if (!error) {
      setNewTableNumber("");
      setIsDrawerOpen(false);
      await fetchInitialData();
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable || !supabase) return;
    const { error } = await supabase
      .from("tables")
      .delete()
      .eq("id", selectedTable.id);
    if (!error) {
      setIsDrawerOpen(false);
      await fetchInitialData();
    }
  };

  // Obtener la orden activa de la mesa seleccionada
  const currentTableOrder = selectedTable
    ? activeOrders.find((o) => o.table_id === selectedTable.id)
    : null;

  if (loading) {
    return (
      <div className=" flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-blue-400 font-bold animate-pulse">
          Sincronizando Salón...
        </p>
      </div>
    );
  }

  return (
    <div className=" bg-slate-950 md:py-10 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <div className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-blue-600 p-4 rounded-[1.5rem] shadow-2xl shadow-blue-900/30 ring-4 ring-blue-600/10">
            <LayoutDashboard className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Mapa de Mesas
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Monitoreo en Vivo
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95">
          <Plus size={22} />
          NUEVA MESA
        </button>
      </div>

      {/* Grid de Mesas */}
      <div className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {tables.map((table) => {
          const metrics = getTableMetrics(table.id);
          return (
            <div
              key={table.id}
              onClick={() => handleOpenDetails(table)}
              className={`group cursor-pointer relative bg-[#1E293B] rounded-[2.5rem] p-8 transition-all duration-500 border-2 ${
                metrics.isOccupied
                  ? "border-blue-500 ring-8 ring-blue-500/5 shadow-2xl translate-y-[-4px]"
                  : "border-slate-800 shadow-sm hover:border-slate-700 hover:translate-y-[-2px]"
              }`}>
              <div className="flex justify-between items-start mb-8">
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-black transition-all duration-500 ${
                    metrics.isOccupied
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40"
                      : "bg-[#0F172A] text-slate-600 border border-slate-800"
                  }`}>
                  {table.number}
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${metrics.isOccupied ? "bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" : "bg-slate-700"}`}></div>
              </div>

              <div className="space-y-5">
                <span
                  className={`text-[11px] font-black uppercase tracking-[0.2em] ${metrics.isOccupied ? "text-green-400" : "text-slate-500"}`}>
                  {metrics.isOccupied ? "Mesa Activa" : "Mesa Libre"}
                </span>

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
                  </div>
                ) : (
                  <div className="pt-5 border-t border-slate-800 opacity-20 italic text-xs">
                    Sin comanda abierta
                  </div>
                )}
              </div>

              {metrics.isOccupied && (
                <div className="mt-8 flex items-center justify-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-blue-300 transition-colors">
                  VER COMANDA{" "}
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              )}
            </div>
          );
        })}

        {!loading && tables.length === 0 && (
          <div className="col-span-full bg-[#1E293B] rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-800/50">
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

      {/* Drawer Inteligente */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#1E293B] h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-800">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black italic tracking-tighter text-white">
                {drawerMode === "create"
                  ? "Nueva Mesa"
                  : `Mesa ${selectedTable?.number}`}
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-3 cursor-pointer hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                <X className="w-7 h-7" />
              </button>
            </div>

            {drawerMode === "create" ? (
              <form
                onSubmit={handleCreateTable}
                className="space-y-8 flex-1 flex flex-col">
                <div className="flex-1">
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
                    className="w-full p-6 bg-[#0F172A] rounded-[1.5rem] outline-none border-2 border-slate-800 focus:border-blue-600 text-white text-5xl font-black transition-all placeholder:text-slate-900"
                  />
                  <p className="text-xs text-slate-600 mt-6 leading-relaxed">
                    Este número se vinculará automáticamente al código QR de la
                    mesa para gestionar pedidos.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 py-5 rounded-2xl font-bold text-slate-500 hover:bg-slate-800 transition-colors">
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all">
                    CREAR MESA
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col">
                {currentTableOrder ? (
                  <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                    <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                          Estado de Comanda
                        </p>
                        <p className="text-xl font-black text-white italic capitalize">
                          {currentTableOrder.state}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                        <Clock className="text-white animate-pulse" size={20} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Receipt size={14} className="text-blue-500" /> Detalle
                        de Pedidos
                      </p>
                      <div className="space-y-3">
                        {currentTableOrder.order_items?.map(
                          (item: any, i: number) => (
                            <div
                              key={i}
                              className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800/50 flex justify-between items-center group/item hover:border-blue-500/30 transition-colors">
                              <div className="flex items-center gap-4">
                                <span className="bg-blue-600/10 text-blue-500 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">
                                  {item.quantity}x
                                </span>
                                <span className="text-sm font-bold text-slate-200">
                                  {item.name || "Plato del menú"}
                                </span>
                              </div>
                              <span className="font-black text-white text-sm">
                                ${(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Total Acumulado
                        </p>
                        <p className="text-4xl font-black text-white mt-1">
                          <span className="text-blue-500 mr-1">$</span>
                          {currentTableOrder.total_price?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <UtensilsCrossed size={32} />
                    </div>
                    <p className="font-bold uppercase text-[10px] tracking-widest">
                      Mesa sin actividad
                    </p>
                  </div>
                )}

                {/* Zona de Peligro / Borrado */}
                <div className="mt-auto pt-8 border-t border-slate-800">
                  {isDeleting ? (
                    <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-3xl animate-in zoom-in duration-300">
                      <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center mb-4">
                        ¿Confirmas la eliminación?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsDeleting(false)}
                          className="flex-1 py-4 bg-slate-800 rounded-xl font-bold text-xs uppercase text-slate-400">
                          Cancelar
                        </button>
                        <button
                          onClick={handleDeleteTable}
                          className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-900/20">
                          Sí, eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsDeleting(true)}
                      className="w-full flex items-center justify-center gap-2 text-slate-700 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl border border-transparent hover:border-red-500/10">
                      <Trash2 size={14} /> ELIMINAR ESTA MESA
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}
