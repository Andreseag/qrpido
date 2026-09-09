import { ActiveOrder, Table } from "@/app/admin/tables/types";
import { Pencil, Trash2, Utensils } from "lucide-react";
import { RoleGuard } from "../../Auth/RoleGuard/RoleGuard";

interface TableCardProps {
  table: Table;
  tableOrders: ActiveOrder[];
  onOpen: (table: Table) => void;
  onEdit: (table: Table) => void;
  onDelete: (id: number) => void;
}

export function TableCard({
  table,
  tableOrders,
  onOpen,
  onEdit,
  onDelete,
}: TableCardProps) {
  const isOccupied = tableOrders.length > 0;
  const tableTotalPrice = tableOrders.reduce(
    (sum, o) => sum + o.total_price,
    0,
  );

  return (
    <div
      onClick={() => onOpen(table)}
      className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.01] shadow-xl group relative ${
        isOccupied
          ? "border-amber-500/60 bg-amber-500/[0.03]"
          : "border-slate-800 hover:border-slate-700"
      }`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
              Mesa Salón
            </span>
            <h3 className="text-white font-black text-2xl mt-0.5">
              #{table.number}
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 ${
              isOccupied
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOccupied ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}></span>
            {isOccupied ? `${tableOrders.length} Ronda(s)` : "DISPONIBLE"}
          </span>
        </div>

        {isOccupied ? (
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 mb-4 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 uppercase text-[10px]">
                Cuenta Total
              </span>
              <span className="text-amber-400 font-black text-sm">
                ${tableTotalPrice.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1.5 pt-1 max-h-24 overflow-y-auto">
              {tableOrders.map((order, rIdx) => (
                <div
                  key={order.id}
                  className="text-[11px] bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-slate-400 font-bold mb-0.5">
                    <span>Ronda #{rIdx + 1}</span>
                    <span className="uppercase text-[9px] text-amber-400 bg-amber-500/10 px-1 rounded">
                      {order.state}
                    </span>
                  </div>
                  {order.items?.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="flex justify-between text-slate-300">
                      <span className="truncate pr-2">
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-6 mb-4 text-center">
            <Utensils className="w-6 h-6 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              Mesa libre lista para tomar pedido
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <span className="text-[11px] font-bold text-amber-400 group-hover:underline flex items-center gap-1">
          {isOccupied ? "Ver Cuenta / Cobrar +" : "Abrir Comanda +"}
        </span>

        <RoleGuard allowedRoles={["owner"]} isPage={false}>
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(table)}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Editar número">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(table.id)}
              className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
              title="Eliminar mesa">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}
