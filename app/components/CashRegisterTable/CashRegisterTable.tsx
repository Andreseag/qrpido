import { CashRegisterRecord } from "@/app/admin/cash-history/types";
import { Clock, Eye } from "lucide-react";

interface CashRegisterTableProps {
  registers: CashRegisterRecord[];
  onViewDetails: (register: CashRegisterRecord) => void;
  formatCurrency: (amount: number | null | undefined) => string;
  formatDate: (dateString: string) => string;
}

export function CashRegisterTable({
  registers,
  onViewDetails,
  formatCurrency,
  formatDate,
}: CashRegisterTableProps) {
  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/50 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              <th className="py-4 px-5">Turno / Fechas</th>
              <th className="py-4 px-4 text-right">Base Inicial</th>
              <th className="py-4 px-4 text-right">Esperado</th>
              <th className="py-4 px-4 text-right">Físico Real</th>
              <th className="py-4 px-4 text-center">Diferencia</th>
              <th className="py-4 px-4 text-center">Estado</th>
              <th className="py-4 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {registers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground">
                  No hay registros de cajas o arqueos en este periodo.
                </td>
              </tr>
            ) : (
              registers.map((reg) => {
                const diff = reg.difference || 0;
                return (
                  <tr
                    key={reg.id}
                    className="hover:bg-background/40 transition-colors">
                    <td className="py-4 px-5 space-y-0.5">
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {formatDate(reg.opened_at)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Cierre:{" "}
                        {reg.closed_at
                          ? formatDate(reg.closed_at)
                          : "En curso..."}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-medium text-muted-foreground">
                      {formatCurrency(reg.initial_amount)}
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-foreground">
                      {formatCurrency(reg.expected_amount)}
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-foreground">
                      {reg.status === "closed" &&
                      reg.real_amount !== null &&
                      reg.real_amount !== undefined ? (
                        formatCurrency(reg.real_amount)
                      ) : (
                        <span className="text-muted-foreground font-normal italic text-[11px]">
                          En curso...
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {reg.status === "closed" ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                            diff === 0
                              ? "bg-emerald-500/10 text-emerald-500"
                              : diff < 0
                                ? "bg-destructive/10 text-destructive"
                                : "bg-amber-500/10 text-amber-500"
                          }`}>
                          {diff === 0
                            ? "Exacto ($0)"
                            : diff < 0
                              ? `Faltante: ${formatCurrency(diff)}`
                              : `Sobrante: +${formatCurrency(diff)}`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {reg.status === "open" ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Abierta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-background border border-border text-muted-foreground px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Cerrada
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => onViewDetails(reg)}
                        className="p-2 rounded-xl bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors shadow-2xs"
                        title="Ver detalle del turno">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
