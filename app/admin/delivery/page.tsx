// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Clock,
//   Phone,
//   MapPin,
//   Bike,
//   CheckCircle2,
//   XCircle,
//   ChefHat,
//   MessageSquare,
//   AlertTriangle,
//   User,
//   RefreshCw,
// } from "lucide-react";
// import { supabase } from "../../lib/supabase";

// interface OrderItem {
//   productId?: string;
//   name: string;
//   price: number;
//   quantity: number;
// }

// interface Order {
//   id: number;
//   created_at: string;
//   items: OrderItem[];
//   state:
//     | "pendiente"
//     | "en_cocina"
//     | "listo"
//     | "en_camino"
//     | "entregado"
//     | "cancelado";
//   order_type?: "mesa" | "llevar" | "domicilio" | string;
//   table_number?: string | null;
//   customer_name?: string | null;
//   customer_phone?: string | null;
//   address?: string | null;
//   payment_method?: string | null;
//   cash_given?: number | null;
//   restaurant_id: number;
//   total_price: number;
//   note?: string | null;
// }

// const COLUMNS = [
//   {
//     id: "pendiente",
//     title: "Pendientes",
//     headerBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
//   },
//   {
//     id: "en_cocina",
//     title: "En Cocina",
//     headerBg: "bg-sky-500/10 border-sky-500/30 text-sky-400",
//   },
//   {
//     id: "listo",
//     title: "Listos / Despacho",
//     headerBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
//   },
//   {
//     id: "en_camino",
//     title: "En Camino",
//     headerBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
//   },
//   {
//     id: "entregado",
//     title: "Entregados",
//     headerBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
//   },
// ];

// export default function DeliveryPage() {
//   const [user, setUser] = useState<any>(null);
//   const [restaurantId, setRestaurantId] = useState<string | null>(null);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [configError, setConfigError] = useState<string | null>(null);
//   const router = useRouter();

//   // 1. Validar sesión y obtener el ID del restaurante
//   useEffect(() => {
//     const initDelivery = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       if (!session) {
//         router.push("/login");
//         return;
//       }
//       setUser(session.user);

//       const { data: restaurant, error } = await supabase
//         .from("restaurants")
//         .select("id")
//         .eq("owner_id", session.user.id)
//         .maybeSingle();

//       if (error || !restaurant) {
//         setConfigError(
//           "No se encontró un restaurante asociado a este usuario.",
//         );
//         setLoading(false);
//         return;
//       }

//       setRestaurantId(restaurant.id);
//     };

//     initDelivery();
//   }, [router]);

//   // 2. Cargar órdenes de domicilio y activar Supabase Realtime
//   useEffect(() => {
//     if (!restaurantId) return;

//     const fetchOrders = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from("orders")
//         .select("*")
//         .eq("restaurant_id", restaurantId)
//         .eq("order_type", "domicilio")
//         .neq("state", "cancelado")
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("Error al cargar órdenes de domicilio:", error);
//       } else if (data) {
//         setOrders(data as Order[]);
//       }
//       setLoading(false);
//     };

//     fetchOrders();

//     const channel = supabase
//       .channel(`delivery-channel-${restaurantId}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "orders",
//           filter: `restaurant_id=eq.${restaurantId}`,
//         },
//         (payload: any) => {
//           const newOrder = payload.new as Order;
//           const oldOrder = payload.old as Order;

//           if (payload.eventType === "INSERT") {
//             if (
//               newOrder.order_type === "domicilio" &&
//               newOrder.state !== "cancelado"
//             ) {
//               setOrders((prev) => [newOrder, ...prev]);
//             }
//           } else if (payload.eventType === "UPDATE") {
//             if (
//               newOrder.order_type === "domicilio" &&
//               newOrder.state !== "cancelado"
//             ) {
//               setOrders((prev) => {
//                 const exists = prev.some((o) => o.id === newOrder.id);
//                 if (exists) {
//                   return prev.map((o) => (o.id === newOrder.id ? newOrder : o));
//                 } else {
//                   return [newOrder, ...prev];
//                 }
//               });
//             } else {
//               // Si cambió de tipo o fue cancelado, lo removemos del tablero de domicilios
//               setOrders((prev) => prev.filter((o) => o.id === newOrder.id));
//             }
//           } else if (payload.eventType === "DELETE") {
//             setOrders((prev) => prev.filter((o) => o.id !== oldOrder.id));
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [restaurantId]);

//   // 3. Cambiar estado del pedido
//   const updateOrderState = async (
//     orderId: number,
//     newState: Order["state"],
//   ) => {
//     const { error } = await supabase
//       .from("orders")
//       .update({ state: newState })
//       .eq("id", orderId);

//     if (error) {
//       console.error("Error al actualizar estado:", error);
//     } else {
//       setOrders((prev) =>
//         prev.map((o) => (o.id === orderId ? { ...o, state: newState } : o)),
//       );
//     }
//   };

//   const getElapsedTime = (createdAt: string) => {
//     return Math.floor(
//       (new Date().getTime() - new Date(createdAt).getTime()) / 60000,
//     );
//   };

//   if (configError) {
//     return (
//       <div className="min-h-screen bg-slate-950 text-white flex">
//         <div className="flex-1 flex items-center justify-center p-6">
//           <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-3xl max-w-md text-center">
//             <AlertTriangle className="text-red-500 w-12 h-12 mx-auto mb-3" />
//             <h2 className="text-lg font-black">Error en Domicilios</h2>
//             <p className="text-slate-400 text-xs mt-1">{configError}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 flex">
//       <main className="flex-1 p-6 md:p-10 overflow-y-auto">
//         {/* Header */}
//         <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
//           <div className="flex items-center gap-3">
//             <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
//               <Bike className="text-amber-400 w-8 h-8" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
//                 Tablero de Domicilios{" "}
//                 <span className="text-amber-400 font-medium text-xs px-2.5 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
//                   Kanban Live
//                 </span>
//               </h1>
//               <p className="text-xs text-slate-400 font-medium">
//                 Gestión en tiempo real exclusiva para pedidos de domicilio
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 bg-slate-900 px-5 py-3 rounded-2xl border border-slate-800">
//             <div className="flex items-center gap-2">
//               <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
//               <span className="text-xs font-black uppercase tracking-wider text-slate-300">
//                 Sincronizado
//               </span>
//             </div>
//             <div className="h-4 w-[1px] bg-slate-800"></div>
//             <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl">
//               {orders.length} Domicilios
//             </span>
//           </div>
//         </header>

//         {/* Loading / Content */}
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-32">
//             <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
//             <p className="text-xs font-black uppercase tracking-widest text-slate-500">
//               Cargando domicilios...
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
//             {COLUMNS.map((col) => {
//               const columnOrders = orders.filter((o) => o.state === col.id);

//               return (
//                 <div
//                   key={col.id}
//                   className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col max-h-[80vh]">
//                   {/* Header de la columna */}
//                   <div
//                     className={`p-3.5 border-b font-black text-xs uppercase tracking-wider flex items-center justify-between rounded-t-2xl ${col.headerBg}`}>
//                     <span>{col.title}</span>
//                     <span className="bg-slate-950/80 px-2 py-0.5 rounded-full text-[11px] font-mono">
//                       {columnOrders.length}
//                     </span>
//                   </div>

//                   {/* Lista de tarjetas */}
//                   <div className="p-3 overflow-y-auto space-y-3 flex-1">
//                     {columnOrders.length === 0 ? (
//                       <div className="text-center py-8">
//                         <p className="text-slate-600 text-xs italic">
//                           Sin domicilios
//                         </p>
//                       </div>
//                     ) : (
//                       columnOrders.map((order) => {
//                         const elapsedMins = getElapsedTime(order.created_at);
//                         const isDelayed =
//                           elapsedMins > 30 && order.state !== "entregado";
//                         const vuelto =
//                           order.cash_given &&
//                           order.cash_given > order.total_price
//                             ? order.cash_given - order.total_price
//                             : 0;

//                         return (
//                           <div
//                             key={order.id}
//                             className={`bg-slate-950 border rounded-xl p-3.5 shadow-lg relative transition-all ${
//                               isDelayed
//                                 ? "border-red-500/60 bg-red-950/10"
//                                 : "border-slate-800/80 hover:border-slate-700"
//                             }`}>
//                             {/* Indicador de tiempo y tipo */}
//                             <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-900">
//                               <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-purple-500/15 text-purple-300 border border-purple-500/30">
//                                 <MapPin className="w-3 h-3" /> Domicilio
//                               </span>

//                               <div
//                                 className={`flex items-center gap-1 text-[10px] font-mono font-bold ${
//                                   isDelayed
//                                     ? "text-red-400 animate-pulse"
//                                     : "text-slate-400"
//                                 }`}>
//                                 <Clock className="w-3 h-3" /> {elapsedMins} min
//                               </div>
//                             </div>

//                             {/* Datos del cliente */}
//                             <div className="mb-3">
//                               <h3 className="font-bold text-white text-xs flex items-center gap-1">
//                                 <User className="w-3 h-3 text-slate-400" />{" "}
//                                 {order.customer_name || `Orden #${order.id}`}
//                               </h3>
//                               {order.customer_phone && (
//                                 <div className="flex items-center justify-between mt-1">
//                                   <span className="text-[11px] text-slate-400 font-mono">
//                                     {order.customer_phone}
//                                   </span>
//                                   <a
//                                     href={`https://wa.me/57${order.customer_phone}?text=Hola%20${encodeURIComponent(
//                                       order.customer_name || "Cliente",
//                                     )},%20te%20escribimos%20de%20nuestro%20restaurante%20sobre%20tu%20pedido.`}
//                                     target="_blank"
//                                     rel="noreferrer"
//                                     className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
//                                     title="Abrir WhatsApp">
//                                     <MessageSquare className="w-3 h-3" />
//                                   </a>
//                                 </div>
//                               )}
//                               {order.address && (
//                                 <p className="text-[11px] text-slate-300 mt-1 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
//                                   📍 {order.address}
//                                 </p>
//                               )}
//                             </div>

//                             {/* Productos del pedido */}
//                             <div className="space-y-1 mb-3 bg-slate-900/40 p-2 rounded-xl border border-slate-900">
//                               {order.items &&
//                                 order.items.map((item, idx) => (
//                                   <div
//                                     key={idx}
//                                     className="flex justify-between text-[11px]">
//                                     <span className="text-slate-300">
//                                       <strong className="text-amber-400 font-mono">
//                                         {item.quantity}x
//                                       </strong>{" "}
//                                       {item.name}
//                                     </span>
//                                     <span className="text-slate-400 font-mono">
//                                       $
//                                       {(
//                                         item.price * item.quantity
//                                       ).toLocaleString()}
//                                     </span>
//                                   </div>
//                                 ))}
//                             </div>

//                             {/* Info de pago y total */}
//                             <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 mb-3 text-[11px] space-y-1">
//                               <div className="flex justify-between">
//                                 <span className="text-slate-400 uppercase font-bold text-[9px]">
//                                   Pago: {order.payment_method || "efectivo"}
//                                 </span>
//                                 <span className="font-black text-amber-400">
//                                   Total: ${order.total_price.toLocaleString()}
//                                 </span>
//                               </div>
//                               {order.payment_method === "efectivo" &&
//                                 order.cash_given && (
//                                   <div className="flex justify-between text-emerald-400 font-bold text-[10px] pt-1 border-t border-slate-800">
//                                     <span>
//                                       Paga con: $
//                                       {order.cash_given.toLocaleString()}
//                                     </span>
//                                     <span>
//                                       Vueltas: ${vuelto.toLocaleString()}
//                                     </span>
//                                   </div>
//                                 )}
//                             </div>

//                             {order.note && (
//                               <p className="text-[10px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-1.5 rounded-lg mb-3 italic">
//                                 Nota: {order.note}
//                               </p>
//                             )}

//                             {/* Botones de avance de estado */}
//                             <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900">
//                               {order.state === "pendiente" && (
//                                 <button
//                                   onClick={() =>
//                                     updateOrderState(order.id, "en_cocina")
//                                   }
//                                   className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer">
//                                   <ChefHat className="w-3 h-3" /> A Cocina
//                                 </button>
//                               )}

//                               {order.state === "en_cocina" && (
//                                 <button
//                                   onClick={() =>
//                                     updateOrderState(order.id, "listo")
//                                   }
//                                   className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer">
//                                   <CheckCircle2 className="w-3 h-3" /> Marcar
//                                   Listo
//                                 </button>
//                               )}

//                               {order.state === "listo" && (
//                                 <button
//                                   onClick={() =>
//                                     updateOrderState(order.id, "en_camino")
//                                   }
//                                   className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer">
//                                   <Bike className="w-3 h-3" /> Enviar (En
//                                   Camino)
//                                 </button>
//                               )}

//                               {order.state === "en_camino" && (
//                                 <button
//                                   onClick={() =>
//                                     updateOrderState(order.id, "entregado")
//                                   }
//                                   className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer">
//                                   <CheckCircle2 className="w-3 h-3" /> Entregado
//                                 </button>
//                               )}

//                               {order.state !== "entregado" && (
//                                 <button
//                                   onClick={() => {
//                                     if (
//                                       confirm(
//                                         "¿Estás seguro de cancelar este pedido?",
//                                       )
//                                     ) {
//                                       updateOrderState(order.id, "cancelado");
//                                     }
//                                   }}
//                                   className="p-1.5 bg-slate-900 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg border border-slate-800 transition-colors cursor-pointer"
//                                   title="Cancelar pedido">
//                                   <XCircle className="w-3.5 h-3.5" />
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

"use client";
import { RefreshCw } from "lucide-react";
import { useDeliveryOrders } from "./hooks/useDeliveryOrders";
import { ConfigErrorScreen } from "./components/ConfigErrorScreen";
import { DeliveryHeader } from "./components/DeliveryHeader";
import { COLUMNS } from "./types";
import { KanbanColumn } from "./components/KanbanColumn";

export default function DeliveryPage() {
  const { orders, loading, configError, updateOrderState } =
    useDeliveryOrders();

  if (configError) {
    return <ConfigErrorScreen message={configError} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <DeliveryHeader orderCount={orders.length} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Cargando domicilios...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                orders={orders.filter((o) => o.state === col.id)}
                onUpdateState={updateOrderState}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
