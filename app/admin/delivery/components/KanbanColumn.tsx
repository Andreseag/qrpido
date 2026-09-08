import { KanbanColumnDef, Order, OrderState } from "../types";
import { OrderCard } from "./OrderCard";

interface KanbanColumnProps {
  column: KanbanColumnDef;
  orders: Order[];
  onUpdateState: (orderId: number, newState: OrderState) => void;
}

export function KanbanColumn({
  column,
  orders,
  onUpdateState,
}: KanbanColumnProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col max-h-[80vh]">
      {/* Header de la columna */}
      <div
        className={`p-3.5 border-b font-black text-xs uppercase tracking-wider flex items-center justify-between rounded-t-2xl ${column.headerBg}`}>
        <span>{column.title}</span>
        <span className="bg-slate-950/80 px-2 py-0.5 rounded-full text-[11px] font-mono">
          {orders.length}
        </span>
      </div>

      {/* Lista de tarjetas */}
      <div className="p-3 overflow-y-auto space-y-3 flex-1">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 text-xs italic">Sin domicilios</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateState={onUpdateState}
            />
          ))
        )}
      </div>
    </div>
  );
}
