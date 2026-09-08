"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  AlertTriangle,
  Flame,
  RefreshCw,
  MessageSquare,
  ShoppingBag,
  MapPin,
  Truck,
  CreditCard,
  Banknote,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { RoleGuard } from "@/app/components/Auth/RoleGuard/RoleGuard";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  items: OrderItem[];
  state: "pendiente" | "preparando" | "listo" | "entregado";
  order_type?: "mesa" | "llevar" | "domicilio" | string;
  table_id?: number | null;
  table_number?: string | null;
  address?: string | null;
  payment_method?: string | null;
  cash_given?: number | null;
  restaurant_id: number;
  total_price: number;
  note?: string | null;
}

export default function KitchenPage() {
  const [user, setUser] = useState<any>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const router = useRouter();

  // 1. Validar sesión y obtener el ID del restaurante mediante restaurant_members
  useEffect(() => {
    const initKitchen = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: memberData, error } = await supabase
        .from("restaurant_members")
        .select("restaurant_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error || !memberData) {
        setConfigError(
          "No se encontró un restaurante asociado a este usuario.",
        );
        setLoading(false);
        return;
      }

      setRestaurantId(memberData.restaurant_id);
    };

    initKitchen();
  }, [router]);

  // 2. Cargar órdenes y activar Supabase Realtime
  useEffect(() => {
    if (!restaurantId) return;

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .in("state", ["pendiente", "preparando"])
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) {
        console.error("Error al cargar órdenes:", error);
      } else if (data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel(`kitchen-channel-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [...prev, payload.new as Order]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) => {
              const updated = payload.new as Order;
              if (["listo", "entregado"].includes(updated.state)) {
                return prev.filter((o) => o.id !== updated.id);
              }
              return prev.map((o) => (o.id === updated.id ? updated : o));
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  // 3. Cambiar estado del pedido
  const updateOrderState = async (
    orderId: number,
    newState: "preparando" | "listo",
  ) => {
    const { error } = await supabase
      .from("orders")
      .update({ state: newState })
      .eq("id", orderId);

    if (error) {
      console.error("Error al actualizar estado:", error);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, state: newState } : o)),
      );
    }
  };

  const getElapsedTime = (createdAt: string) => {
    return Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / 60000,
    );
  };

  if (configError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-3xl max-w-md text-center">
            <AlertTriangle className="text-red-500 w-12 h-12 mx-auto mb-3" />
            <h2 className="text-lg font-black">Error en Cocina</h2>
            <p className="text-slate-400 text-xs mt-1">{configError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["owner", "chef"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                <ChefHat className="text-amber-400 w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Pantalla de Cocina{" "}
                  <span className="text-amber-400 font-medium text-xs px-2.5 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                    KDS Live
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Despacho de comandas en tiempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 px-5 py-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Sincronizado
                </span>
              </div>
              <div className="h-4 w-[1px] bg-slate-800"></div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl">
                {orders.length} Activas
              </span>
            </div>
          </header>

          {/* Grid de Comandas */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                Cargando comandas...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-900/40 rounded-3xl border border-slate-900 text-center p-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-500/40 mb-4" />
              <h2 className="text-xl font-bold text-slate-300">
                ¡Cocina al día!
              </h2>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">
                No hay pedidos pendientes. Las nuevas órdenes aparecerán aquí
                automáticamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {orders.map((order) => {
                const elapsedMins = getElapsedTime(order.created_at);
                const isDelayed = elapsedMins > 20;
                const orderType =
                  order.order_type || (order.table_id ? "mesa" : "llevar");

                return (
                  <div
                    key={order.id}
                    className={`bg-slate-900 rounded-3xl border flex flex-col justify-between transition-all overflow-hidden shadow-2xl ${
                      isDelayed
                        ? "border-red-500/50 shadow-red-950/30"
                        : "border-slate-800"
                    }`}>
                    {/* Tipo de Pedido e Identificador */}
                    <div
                      className={`p-4 flex items-center justify-between border-b ${
                        order.state === "preparando"
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-slate-950/40 border-slate-800"
                      }`}>
                      <div className="flex items-center gap-2">
                        {orderType === "mesa" && (
                          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-xl">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                              Mesa
                            </span>
                            <span className="text-sm font-black text-white bg-blue-900/50 px-2 py-0.5 rounded-lg border border-blue-500/30">
                              #{order.table_number || "N/A"}
                            </span>
                          </div>
                        )}

                        {orderType === "llevar" && (
                          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-xl">
                            <ShoppingBag className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                              Para Llevar
                            </span>
                          </div>
                        )}

                        {orderType === "domicilio" && (
                          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                            <Truck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                              Domicilio
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                          isDelayed
                            ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                            : "bg-slate-800 text-slate-300"
                        }`}>
                        <Clock size={13} />
                        <span>{elapsedMins} min</span>
                      </div>
                    </div>

                    {/* Detalle de Platos y Dirección si es Domicilio */}
                    <div className="p-5 flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                          Orden #{order.id}
                        </span>
                        {order.payment_method && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                            {order.payment_method === "efectivo" ? (
                              <Banknote
                                size={11}
                                className="text-emerald-400"
                              />
                            ) : (
                              <CreditCard size={11} className="text-blue-400" />
                            )}
                            {order.payment_method}
                          </span>
                        )}
                      </div>

                      {/* Dirección para domicilios */}
                      {orderType === "domicilio" && order.address && (
                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                              Dirección de entrega
                            </span>
                            <p className="text-xs text-slate-200 font-medium">
                              {order.address}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="divide-y divide-slate-800/60">
                        {order.items &&
                          order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-2.5 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                              <div className="flex items-start gap-2.5">
                                <span className="bg-amber-500/20 text-amber-400 font-black text-xs px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
                                  {item.quantity}x
                                </span>
                                <span className="text-sm font-bold text-slate-200 leading-snug">
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Observación / Nota del pedido */}
                      {order.note && order.note.trim() !== "" && (
                        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5">
                          <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-0.5">
                              Observación del cliente
                            </span>
                            <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                              {order.note}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botones de Acción */}
                    <div className="p-4 bg-slate-950/40 border-t border-slate-800">
                      {order.state === "pendiente" ? (
                        <button
                          onClick={() =>
                            updateOrderState(order.id, "preparando")
                          }
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer">
                          <Flame size={16} />
                          Empezar a Preparar
                        </button>
                      ) : (
                        <button
                          onClick={() => updateOrderState(order.id, "listo")}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 cursor-pointer">
                          <CheckCircle2 size={16} />
                          Marcar como Listo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
