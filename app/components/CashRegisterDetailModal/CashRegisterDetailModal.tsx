"use client";

import { useState } from "react";
import {
  Calculator,
  AlertTriangle,
  FileText,
  X,
  ShoppingBag,
  Utensils,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { CashRegisterRecord } from "@/app/admin/cash-history/types";

interface CashRegisterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  register: CashRegisterRecord | null;
  orders: any[]; // 👈 Órdenes asociadas a este turno de caja
  formatCurrency: (amount: number | null | undefined) => string;
  formatDate: (dateString: string) => string;
  onProcessPayment?: (orderId: string, paymentMethod: string) => Promise<void>; // 👈 Función para cobrar
}

export function CashRegisterDetailModal({
  isOpen,
  onClose,
  register,
  orders = [],
  formatCurrency,
  formatDate,
  onProcessPayment,
}: CashRegisterDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "orders">("summary");
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen || !register) return null;

  const handlePayment = async (orderId: string, method: string) => {
    if (!onProcessPayment) return;
    setProcessingId(orderId);
    await onProcessPayment(orderId, method);
    setProcessingId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}>
      <div
        className="bg-background border border-border w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        {/* Cabecera Modal */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-2xl border border-primary/20">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                Auditoría de Turno & Órdenes
              </h2>
              <p className="text-xs text-muted-foreground">
                Turno del {formatDate(register.opened_at)}{" "}
                {register.closed_at
                  ? `a ${formatDate(register.closed_at)}`
                  : "(En curso)"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-background/80 hover:bg-background text-foreground p-2 rounded-full transition-colors border border-border">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- PESTAÑAS (TABS) --- */}
        <div className="flex border-b border-border px-6 pt-3 bg-surface/30 gap-6">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === "summary"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            1. Resumen y Cuadre
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            2. Órdenes del Turno ({orders.length})
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === "summary" ? (
            /* --- TAB 1: RESUMEN Y CUADRE --- */
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface p-3.5 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Base Inicial
                  </span>
                  <span className="text-sm font-bold text-foreground mt-1 block">
                    {formatCurrency(register.initial_amount)}
                  </span>
                </div>
                <div className="bg-surface p-3.5 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Ventas en Efectivo
                  </span>
                  <span className="text-sm font-bold text-primary mt-1 block">
                    {formatCurrency(register.cash_sales || 0)}
                  </span>
                </div>
                <div className="bg-surface p-3.5 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Dinero Esperado
                  </span>
                  <span className="text-sm font-bold text-foreground mt-1 block">
                    {formatCurrency(register.expected_amount)}
                  </span>
                </div>
                <div className="bg-surface p-3.5 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Físico Contado
                  </span>
                  <span className="text-sm font-bold text-foreground mt-1 block">
                    {register.status === "closed" &&
                    register.real_amount !== null &&
                    register.real_amount !== undefined ? (
                      formatCurrency(register.real_amount)
                    ) : (
                      <span className="text-muted-foreground font-normal italic text-xs">
                        Caja abierta (Pendiente)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {register.status === "closed" && (
                <div
                  className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    (register.difference || 0) === 0
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      : (register.difference || 0) < 0
                        ? "bg-destructive/10 border-destructive/20 text-destructive"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  }`}>
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">
                      {(register.difference || 0) === 0
                        ? "¡Caja Cuadrada Exacta!"
                        : (register.difference || 0) < 0
                          ? "Faltante en Caja"
                          : "Sobrante en Caja"}
                    </span>
                    <span className="text-sm font-bold">
                      Diferencia registrada:{" "}
                      {formatCurrency(register.difference || 0)}
                    </span>
                  </div>
                </div>
              )}

              {register.notes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Notas u observaciones del turno:
                  </span>
                  <p className="text-xs text-muted-foreground bg-surface p-3 rounded-2xl border border-border leading-relaxed">
                    {register.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* --- TAB 2: LISTADO DE ÓRDENES DEL TURNO --- */
            <div className="space-y-3 animate-in fade-in duration-150">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  No hay órdenes registradas asociadas a este turno de caja.
                </div>
              ) : (
                orders.map((order) => {
                  const isPaid = order.state === "pagado";
                  const isTable = order.order_type === "mesa";

                  return (
                    <div
                      key={order.id}
                      className="bg-surface border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Info de la Orden */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-xl border ${isTable ? "bg-primary/10 border-primary/20 text-primary" : "bg-amber-500/10 border-amber-500/20 text-amber-500"}`}>
                            {isTable ? (
                              <Utensils className="w-3.5 h-3.5" />
                            ) : (
                              <ShoppingBag className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <span className="font-black text-foreground text-xs">
                            {isTable
                              ? `Mesa #${order.table_number || "—"}`
                              : `Domicilio: ${order.customer_name || "Cliente"}`}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPaid
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}>
                            {isPaid ? "Pagado" : "Pendiente de Pago"}
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {order.items
                            ?.map((i: any) => `${i.quantity}x ${i.name}`)
                            .join(", ")}
                        </p>
                      </div>

                      {/* Total y Acción de Cobro */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-2 sm:pt-0 border-border">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                            Total
                          </span>
                          <span className="text-sm font-black text-foreground">
                            {formatCurrency(order.total_price)}
                          </span>
                        </div>

                        {!isPaid && (
                          <button
                            disabled={processingId === order.id}
                            onClick={() => handlePayment(order.id, "cash")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50">
                            <DollarSign className="w-3.5 h-3.5" />
                            {processingId === order.id
                              ? "Cobrando..."
                              : "Cobrar Efectivo"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 border-t border-border bg-surface/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-wide hover:opacity-95 transition-opacity cursor-pointer">
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}
