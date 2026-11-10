import { Calculator, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface CashRegisterMetricsProps {
  totalCashCollected: number;
  totalDiscrepancy: number;
  closedShiftsCount: number;
  formatCurrency: (amount: number | null | undefined) => string;
}

export function CashRegisterMetrics({
  totalCashCollected,
  totalDiscrepancy,
  closedShiftsCount,
  formatCurrency,
}: CashRegisterMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-surface border border-border rounded-2xl p-4 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-bold uppercase tracking-wider">
            Efectivo en Turnos
          </span>
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
        <p className="text-2xl font-black text-foreground">
          {formatCurrency(totalCashCollected)}
        </p>
        <span className="text-[11px] text-muted-foreground">
          Total recaudado en físico
        </span>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-bold uppercase tracking-wider">
            Cuadre Neto (Diferencia)
          </span>
          {totalDiscrepancy < 0 ? (
            <TrendingDown className="w-4 h-4 text-destructive" />
          ) : (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          )}
        </div>
        <p
          className={`text-2xl font-black ${
            totalDiscrepancy < 0 ? "text-destructive" : "text-foreground"
          }`}>
          {formatCurrency(totalDiscrepancy)}
        </p>
        <span className="text-[11px] text-muted-foreground">
          Sobrantes vs Faltantes acumulados
        </span>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-bold uppercase tracking-wider">
            Turnos Auditados
          </span>
          <Calculator className="w-4 h-4 text-primary" />
        </div>
        <p className="text-2xl font-black text-foreground">
          {closedShiftsCount}
        </p>
        <span className="text-[11px] text-muted-foreground">
          Sesiones cerradas correctamente
        </span>
      </div>
    </div>
  );
}
