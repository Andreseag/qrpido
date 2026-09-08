import { ShoppingBag } from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  total_price: number;
  state: string;
  items: OrderItem[];
}

interface RecentOrdersCardProps {
  orders: Order[];
}

export default function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <ShoppingBag className="text-amber-400 w-5 h-5" /> Actividad Reciente
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-3 py-1 rounded-xl">
          Últimas Comandas
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No hay órdenes registradas todavía.
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
          {orders.slice(0, 6).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-xs">
                    Orden #{order.id}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                      order.state === "entregado"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : order.state === "listo"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                    {order.state}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-white text-sm">
                  ${(Number(order.total_price) || 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
