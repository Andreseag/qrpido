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
    <div className="bg-surface rounded-3xl border border-border p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h3 className="text-lg font-black text-foreground flex items-center gap-2">
          <ShoppingBag className="text-primary w-5 h-5" /> Actividad Reciente
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background px-3 py-1 rounded-xl border border-border/50">
          Últimas Comandas
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No hay órdenes registradas todavía.
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
          {orders.slice(0, 6).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-foreground text-xs">
                    Orden #{order.id}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      order.state === "entregado"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : order.state === "listo"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : "bg-muted text-muted-foreground border-border"
                    }`}>
                    {order.state}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-foreground text-sm">
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
