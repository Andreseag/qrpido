"use client";
import { useState, useEffect } from "react";
import {
  Wallet,
  Lock,
  Unlock,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

interface CashRegisterModalProps {
  isOpen: boolean;
  mode: "open" | "close";
  expectedAmount?: number; // Calculado por el sistema en el cierre
  suggestedBase?: number; // Base sugerida para el siguiente turno
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CashRegisterModal({
  isOpen,
  mode,
  expectedAmount = 0,
  suggestedBase = 100000,
  onClose,
  onSubmit,
}: CashRegisterModalProps) {
  // Estados para Apertura
  const [initialAmount, setInitialAmount] = useState(suggestedBase.toString());

  // Estados para Cierre
  const [finalCountedAmount, setFinalCountedAmount] = useState("");
  const [nextShiftBase, setNextShiftBase] = useState(suggestedBase.toString());
  const [notes, setNotes] = useState("");

  // Sincronizar bases sugeridas si cambian por props
  useEffect(() => {
    if (suggestedBase) {
      setInitialAmount(suggestedBase.toString());
      setNextShiftBase(suggestedBase.toString());
    }
  }, [suggestedBase]);

  console.log("isOpen: ", isOpen);

  if (!isOpen) return null;

  // Cálculos automáticos para el Cierre
  const countedNum = parseFloat(finalCountedAmount) || 0;
  const baseNum = parseFloat(nextShiftBase) || 0;
  const difference = countedNum - expectedAmount;
  const withdrawnAmount = Math.max(0, countedNum - baseNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "open") {
      onSubmit({ initialAmount: parseFloat(initialAmount) || 0 });
    } else {
      onSubmit({
        finalCountedAmount: countedNum,
        expectedAmount,
        difference,
        nextShiftBase: baseNum,
        withdrawnAmount,
        notes,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Cabecera del Modal */}
        <div className="bg-background px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${mode === "open" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
              {mode === "open" ? (
                <Unlock className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                {mode === "open"
                  ? "Apertura de Caja"
                  : "Corte y Cierre de Caja"}
              </h2>
              <p className="text-[10px] text-muted-foreground font-medium">
                {mode === "open"
                  ? "Establece el fondo inicial para operar"
                  : "Arqueo de efectivo y retiro de turno"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-border/60 rounded-xl transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === "open" ? (
            /* 🔓 VISTA DE APERTURA */
            <div className="space-y-3">
              <div>
                <label className="font-bold uppercase text-[10px] text-muted-foreground tracking-wider block mb-1.5">
                  Fondo Inicial en Efectivo (Base)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted-foreground font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 100000"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full p-3 pl-8 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-bold text-sm"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 italic">
                  * Este monto corresponde al dinero heredado del turno anterior
                  o base inicial en gaveta.
                </p>
              </div>
            </div>
          ) : (
            /* 🔒 VISTA DE CIERRE / ARQUEO */
            <div className="space-y-4">
              {/* Tarjeta de Resumen Teórico */}
              <div className="bg-background/80 border border-border/80 p-3.5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Efectivo Esperado (Sistema):</span>
                  <span className="font-bold text-foreground">
                    ${expectedAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Conteo físico */}
              <div>
                <label className="font-bold uppercase text-[10px] text-muted-foreground tracking-wider block mb-1.5">
                  Dinero Contado Físicamente en Gaveta
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted-foreground font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 250000"
                    value={finalCountedAmount}
                    onChange={(e) => setFinalCountedAmount(e.target.value)}
                    className="w-full p-3 pl-8 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-bold text-sm"
                  />
                </div>
              </div>

              {/* Indicador de Diferencia (Cuadre) */}
              {finalCountedAmount !== "" && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                    difference === 0
                      ? "bg-success/10 border-success/30 text-success"
                      : difference > 0
                        ? "bg-info/10 border-info/30 text-info"
                        : "bg-danger/10 border-danger/30 text-danger"
                  }`}>
                  {difference === 0 ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span className="font-bold">
                    {difference === 0 && "¡Caja cuadrada perfectamente!"}
                    {difference > 0 &&
                      `Sobrante en caja: +$${difference.toLocaleString()}`}
                    {difference < 0 &&
                      `Faltante en caja: -$${Math.abs(difference).toLocaleString()}`}
                  </span>
                </div>
              )}

              {/* Base para el siguiente turno */}
              <div>
                <label className="font-bold uppercase text-[10px] text-muted-foreground tracking-wider block mb-1.5">
                  Base a dejar para el próximo turno
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted-foreground font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    value={nextShiftBase}
                    onChange={(e) => setNextShiftBase(e.target.value)}
                    className="w-full p-3 pl-8 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium text-xs"
                  />
                </div>
              </div>

              {/* Resultado de lo que se retira */}
              <div className="bg-primary/10 border border-primary/20 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary uppercase text-[10px] tracking-wider">
                    Efectivo Neto a Retirar:
                  </span>
                </div>
                <span className="font-black text-primary text-sm">
                  ${withdrawnAmount.toLocaleString()}
                </span>
              </div>

              {/* Observaciones */}
              <div>
                <label className="font-bold uppercase text-[10px] text-muted-foreground tracking-wider block mb-1.5">
                  Observaciones / Notas de Cierre
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cambio entregado de más en la mesa 3..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium text-xs"
                />
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-border/40 transition-all cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-primary/20">
              {mode === "open" ? "Abrir Caja" : "Confirmar Cierre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
