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
      className={`bg-surface border rounded-3xl p-6 flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.01] shadow-xl group relative ${
        isOccupied
          ? "border-primary/60 bg-primary/[0.03]"
          : "border-border hover:border-border/80"
      }`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
              Mesa Salón
            </span>
            <h3 className="text-foreground font-black text-2xl mt-0.5">
              #{table.number}
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 ${
              isOccupied
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
            }`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOccupied
                  ? "bg-primary animate-pulse"
                  : "bg-emerald-500 dark:bg-emerald-400"
              }`}></span>
            {isOccupied ? `${tableOrders.length} Ronda(s)` : "DISPONIBLE"}
          </span>
        </div>

        {isOccupied ? (
          <div className="bg-background/80 border border-border rounded-2xl p-3.5 mb-4 space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground border-b border-border pb-2">
              <span className="font-bold text-primary uppercase text-[10px]">
                Cuenta Total
              </span>
              <span className="text-primary font-black text-sm">
                ${tableTotalPrice.toLocaleString()}
              </span>
            </div>
            <div className="space-y-1.5 pt-1 max-h-24 overflow-y-auto">
              {tableOrders.map((order, rIdx) => (
                <div
                  key={order.id}
                  className="text-[11px] bg-surface/80 p-1.5 rounded-lg border border-border">
                  <div className="flex justify-between text-muted-foreground font-bold mb-0.5">
                    <span>Ronda #{rIdx + 1}</span>
                    <span className="uppercase text-[9px] text-primary bg-primary/10 px-1 rounded">
                      {order.state}
                    </span>
                  </div>
                  {order.items?.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="flex justify-between text-foreground">
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
          <div className="bg-background/40 border border-border rounded-2xl p-6 mb-4 text-center">
            <Utensils className="w-6 h-6 text-muted-foreground/60 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">
              Mesa libre lista para tomar pedido
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-[11px] font-bold text-primary group-hover:underline flex items-center gap-1">
          {isOccupied ? "Ver Cuenta / Cobrar +" : "Abrir Comanda +"}
        </span>

        <RoleGuard allowedRoles={["owner"]} isPage={false}>
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(table)}
              className="p-2 hover:bg-border text-muted-foreground hover:text-foreground rounded-xl transition-colors cursor-pointer"
              title="Editar número">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(table.id)}
              className="p-2 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-colors cursor-pointer"
              title="Eliminar mesa">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}
