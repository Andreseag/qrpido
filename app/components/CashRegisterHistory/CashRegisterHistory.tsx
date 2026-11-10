"use client";

import { CashRegisterRecord } from "@/app/admin/cash-history/types";
import { CashRegisterMetrics } from "../CashRegisterMetrics/CashRegisterMetrics";
import { CashRegisterTable } from "../CashRegisterTable/CashRegisterTable";
import { PageHeader } from "../PageHeader/PageHeader";
import { Calculator } from "lucide-react";

interface CashRegisterHistoryProps {
  registers: CashRegisterRecord[];
  onViewDetails: (register: CashRegisterRecord) => void;
}

export default function CashRegisterHistory({
  registers,
  onViewDetails,
}: CashRegisterHistoryProps) {
  // Calcular métricas rápidas (KPIs) globales del listado
  const totalCashCollected = registers.reduce(
    (acc, reg) => acc + (reg.cash_sales || 0),
    0,
  );
  const totalDiscrepancy = registers.reduce(
    (acc, reg) => acc + (reg.difference || 0),
    0,
  );
  const closedShiftsCount = registers.filter(
    (r) => r.status === "closed",
  ).length;

  const handleOpenDetail = (register: CashRegisterRecord) => {
    onViewDetails(register);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = Number(amount) || 0;
    return `$${safeAmount.toLocaleString("es-CO")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="space-y-6">
      {/* --- ENCABEZADO GLOBAL REUTILIZABLE --- */}
      <PageHeader
        title="Historial & Arqueos de Caja"
        description="Auditoría de turnos, efectivo recaudado y control de cuadres"
        icon={Calculator}
        showAction={false} // Como los arqueos son solo de consulta/auditoría, ocultamos el botón de acción por defecto
      />

      {/* --- TARJETAS DE MÉTRICAS (KPIs) --- */}
      <CashRegisterMetrics
        totalCashCollected={totalCashCollected}
        totalDiscrepancy={totalDiscrepancy}
        closedShiftsCount={closedShiftsCount}
        formatCurrency={formatCurrency}
      />

      {/* --- TABLA DE HISTORIAL --- */}
      <CashRegisterTable
        registers={registers}
        onViewDetails={handleOpenDetail}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
}
