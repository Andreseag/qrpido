"use client";
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
import { RoleGuard } from "@/app/components/Auth/RoleGuard/RoleGuard";
import { useKitchenOrders } from "./hooks/useKitchenOrders";
import { getElapsedTime } from "../delivery/utils";

export default function KitchenPage() {
  const { orders, loading, configError, updateOrderState } = useKitchenOrders();

  if (configError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-3xl max-w-md text-center">
            <AlertTriangle className="text-destructive w-12 h-12 mx-auto mb-3" />
            <h2 className="text-lg font-black">Error en Cocina</h2>
            <p className="text-muted-foreground text-xs mt-1">{configError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["owner", "chef"]}>
      <div className="min-h-screen bg-background text-foreground flex">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
                <ChefHat className="text-primary w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                  Pantalla de Cocina{" "}
                  <span className="text-primary font-medium text-xs px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                    KDS Live
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Despacho de comandas en tiempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-surface px-5 py-3 rounded-2xl border border-border">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Sincronizado
                </span>
              </div>
              <div className="h-4 w-[1px] bg-border"></div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-xl">
                {orders.length} Activas
              </span>
            </div>
          </header>

          {/* Grid de Comandas */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Cargando comandas...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-surface/40 rounded-3xl border border-border text-center p-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
              <h2 className="text-xl font-bold text-foreground">
                ¡Cocina al día!
              </h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm">
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
                    className={`bg-surface rounded-3xl border flex flex-col justify-between transition-all overflow-hidden shadow-2xl ${
                      isDelayed
                        ? "border-destructive/50 shadow-destructive/10"
                        : "border-border"
                    }`}>
                    {/* Tipo de Pedido e Identificador */}
                    <div
                      className={`p-4 flex items-center justify-between border-b ${
                        order.state === "preparando"
                          ? "bg-primary/10 border-primary/20"
                          : "bg-background/40 border-border"
                      }`}>
                      <div className="flex items-center gap-2">
                        {orderType === "mesa" && (
                          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-xl">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-500 dark:text-blue-400">
                              Mesa
                            </span>
                            <span className="text-sm font-black text-foreground bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-500/30">
                              #{order.table_number || "N/A"}
                            </span>
                          </div>
                        )}

                        {orderType === "llevar" && (
                          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-xl">
                            <ShoppingBag className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-purple-500 dark:text-purple-300">
                              Para Llevar
                            </span>
                          </div>
                        )}

                        {orderType === "domicilio" && (
                          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                            <Truck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-500 dark:text-emerald-300">
                              Domicilio
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                          isDelayed
                            ? "bg-destructive/20 text-destructive border border-destructive/30 animate-pulse"
                            : "bg-border text-muted-foreground"
                        }`}>
                        <Clock size={13} />
                        <span>{elapsedMins} min</span>
                      </div>
                    </div>

                    {/* Detalle de Platos y Dirección si es Domicilio */}
                    <div className="p-5 flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Orden #{order.id}
                        </span>
                        {order.payment_method && (
                          <span className="text-[10px] font-bold text-muted-foreground bg-border px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                            {order.payment_method === "efectivo" ? (
                              <Banknote
                                size={11}
                                className="text-emerald-500 dark:text-emerald-400"
                              />
                            ) : (
                              <CreditCard
                                size={11}
                                className="text-blue-500 dark:text-blue-400"
                              />
                            )}
                            {order.payment_method}
                          </span>
                        )}
                      </div>

                      {/* Dirección para domicilios */}
                      {orderType === "domicilio" && order.address && (
                        <div className="bg-background/60 border border-border rounded-2xl p-3 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                              Dirección de entrega
                            </span>
                            <p className="text-xs text-foreground font-medium">
                              {order.address}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="divide-y divide-border/60">
                        {order.items &&
                          order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-2.5 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                              <div className="flex items-start gap-2.5">
                                <span className="bg-primary/20 text-primary font-black text-xs px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
                                  {item.quantity}x
                                </span>
                                <span className="text-sm font-bold text-foreground leading-snug">
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Observación / Nota del pedido */}
                      {order.note && order.note.trim() !== "" && (
                        <div className="mt-4 bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-start gap-2.5">
                          <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary block mb-0.5">
                              Observación del cliente
                            </span>
                            <p className="text-xs text-primary/90 font-medium leading-relaxed">
                              {order.note}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botones de Acción */}
                    <div className="p-4 bg-background/40 border-t border-border">
                      {order.state === "pendiente" ? (
                        <button
                          onClick={() =>
                            updateOrderState(order.id, "preparando")
                          }
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 active:scale-95 cursor-pointer">
                          <Flame size={16} />
                          Empezar a Preparar
                        </button>
                      ) : (
                        <button
                          onClick={() => updateOrderState(order.id, "listo")}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer">
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
