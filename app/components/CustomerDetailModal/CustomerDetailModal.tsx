"use client";
import { useState, useEffect } from "react";
import {
  X,
  ShoppingBag,
  Heart,
  Calendar,
  DollarSign,
  Clock,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string;
  created_at: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  order_type: string;
  items: OrderItem[];
  state: string;
}

interface CustomerDetailModalProps {
  customer: Customer;
  restaurantId: string;
  onClose: () => void;
}

export default function CustomerDetailModal({
  customer,
  restaurantId,
  onClose,
}: CustomerDetailModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders();
  }, [customer.id]);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id, created_at, total_price, order_type, items, state")
      .eq("restaurant_id", restaurantId)
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  // Cálculo de estadísticas clave
  const totalSpent = orders.reduce((acc, o) => acc + o.total_price, 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Cálculo del plato favorito
  const favoriteDish = (() => {
    if (orders.length === 0) return "Sin pedidos registrados";
    const itemCounts: { [name: string]: number } = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    let topItem = "Ninguno";
    let maxQty = 0;
    Object.entries(itemCounts).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topItem = name;
      }
    });
    return maxQty > 0 ? `${topItem} (${maxQty} unids.)` : "Sin platos";
  })();

  const rawTopItemName = (() => {
    if (orders.length === 0) return null;
    const itemCounts: { [name: string]: number } = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    let topItem = null;
    let maxQty = 0;
    Object.entries(itemCounts).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topItem = name;
      }
    });
    return topItem;
  })();

  const lastOrderDate = orders[0]?.created_at
    ? new Date(orders[0].created_at).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Nunca";

  // Función para disparo de campaña de reenganche por WhatsApp (Recompra en 1 Clic)
  const handleWhatsAppReorder = () => {
    const cleanPhone = customer.phone.replace(/\D/g, "");
    const dishText = rawTopItemName
      ? `tu plato favorito *${rawTopItemName}*`
      : "tus platos favoritos";

    const message = `¡Hola ${customer.name}! 👋 Qué gusto saludarte. Notamos que te encanta ${dishText}. ¿Te provoca repetir tu pedido hoy? 🍔🔥 Escríbenos por aquí con un clic y te lo preparamos de inmediato. ¡Buen provecho!`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-base">{customer.name}</h3>
            <p className="text-xs text-slate-400 font-medium">
              WhatsApp: {customer.phone}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold uppercase text-[10px]">Pedidos</span>
              </div>
              <p className="text-sm font-black text-white">{totalOrders}</p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold uppercase text-[10px]">
                  Total Gastado
                </span>
              </div>
              <p className="text-sm font-black text-amber-400">
                ${totalSpent.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-bold uppercase text-[10px]">
                  Ticket Promedio
                </span>
              </div>
              <p className="text-sm font-black text-white">
                ${Math.round(averageTicket).toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold uppercase text-[10px]">
                  Última Compra
                </span>
              </div>
              <p className="text-xs font-black text-white truncate">
                {lastOrderDate}
              </p>
            </div>
          </div>

          {/* Plato Favorito & Campaña Reenganche WhatsApp */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-slate-950 p-2.5 rounded-xl font-black shrink-0">
                <Heart className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 block tracking-wider">
                  Plato Favorito del Cliente
                </span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {favoriteDish}
                </p>
              </div>
            </div>

            <button
              onClick={handleWhatsAppReorder}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 shrink-0">
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              Recompra 1 Clic
            </button>
          </div>

          <div>
            <h4 className="font-bold uppercase text-slate-400 tracking-wider mb-3">
              Historial de Pedidos ({orders.length})
            </h4>

            {loading ? (
              <p className="text-center py-6 text-slate-500 italic">
                Cargando historial...
              </p>
            ) : orders.length === 0 ? (
              <p className="text-center py-6 text-slate-500 italic">
                Este cliente aún no registra órdenes.
              </p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white uppercase text-[11px]">
                          {order.order_type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.created_at).toLocaleString("es-CO", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <span className="font-black text-amber-400 text-xs">
                        ${order.total_price.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-slate-300">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-slate-400">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
