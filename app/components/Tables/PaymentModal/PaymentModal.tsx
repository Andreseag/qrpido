"use client";
import { useState, useEffect } from "react";
import { X, Receipt, Users, Banknote, CreditCard, Check } from "lucide-react";
import { ActiveOrder, PaymentMethod } from "@/app/admin/tables/types";

interface PaymentModalProps {
  isOpen: boolean;
  tableNumber: number;
  tableOrders: ActiveOrder[];
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (
    grandTotal: number,
    tipAmount: number,
    paymentMethod: PaymentMethod,
  ) => void;
}

export function PaymentModal({
  isOpen,
  tableNumber,
  tableOrders,
  isSaving,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  const [tipPercentage, setTipPercentage] = useState<number>(10); // 10% por defecto (estándar Colombia)
  const [customTipInput, setCustomTipInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [cashReceivedInput, setCashReceivedInput] = useState("");
  const [splitPeopleCount, setSplitPeopleCount] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setTipPercentage(10);
      setCustomTipInput("");
      setPaymentMethod("efectivo");
      setCashReceivedInput("");
      setSplitPeopleCount(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotalAmount = tableOrders.reduce((sum, o) => sum + o.total_price, 0);
  const calculatedTip =
    tipPercentage === -1
      ? parseFloat(customTipInput) || 0
      : (subtotalAmount * tipPercentage) / 100;
  const grandTotal = subtotalAmount + calculatedTip;
  const splitTotal =
    splitPeopleCount > 1 ? grandTotal / splitPeopleCount : grandTotal;
  const cashGivenNum = parseFloat(cashReceivedInput) || 0;
  const changeAmount =
    paymentMethod === "efectivo" && cashGivenNum >= grandTotal
      ? cashGivenNum - grandTotal
      : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Caja Registradora POS
              </span>
              <h2 className="text-lg font-black text-white">
                Cobrar Mesa #{tableNumber}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal Consumos:</span>
            <span className="font-bold text-white">
              ${subtotalAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>
              Propina Voluntaria (
              {tipPercentage === -1 ? "Personalizada" : `${tipPercentage}%`}):
            </span>
            <span className="font-bold text-emerald-400">
              + ${calculatedTip.toLocaleString()}
            </span>
          </div>
          <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center">
            <span className="text-sm font-black text-white uppercase tracking-wider">
              Total a Pagar:
            </span>
            <span className="text-xl font-black text-amber-400">
              ${grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
            Sugerir Propina (Servicio)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[0, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  setTipPercentage(pct);
                  setCustomTipInput("");
                }}
                className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                  tipPercentage === pct
                    ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}>
                {pct === 0 ? "Sin Propina" : `${pct}%`}
              </button>
            ))}
            <button
              onClick={() => setTipPercentage(-1)}
              className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                tipPercentage === -1
                  ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}>
              Otro $
            </button>
          </div>

          {tipPercentage === -1 && (
            <div className="mt-3">
              <input
                type="number"
                placeholder="Ingresa valor de propina en pesos ($)"
                value={customTipInput}
                onChange={(e) => setCustomTipInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Dividir Cuenta (Partes Iguales)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={splitPeopleCount <= 1}
                onClick={() =>
                  setSplitPeopleCount((prev) => Math.max(1, prev - 1))
                }
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
                -
              </button>
              <span className="text-xs font-black text-amber-400 w-6 text-center">
                {splitPeopleCount} pers.
              </span>
              <button
                onClick={() => setSplitPeopleCount((prev) => prev + 1)}
                className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
                +
              </button>
            </div>
          </div>
          {splitPeopleCount > 1 && (
            <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
              <span>Pago por cada persona ({splitPeopleCount} personas):</span>
              <span className="font-black text-emerald-400 text-sm">
                ${Math.ceil(splitTotal).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
            Método de Pago Principal
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "efectivo" as const, label: "Efectivo", icon: Banknote },
              { id: "tarjeta" as const, label: "Tarjeta", icon: CreditCard },
              {
                id: "transferencia" as const,
                label: "Nequi / Transf.",
                icon: Receipt,
              },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-3 px-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer border ${
                    paymentMethod === m.id
                      ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}>
                  <Icon className="w-5 h-5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {paymentMethod === "efectivo" && (
            <div className="mt-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">
                Efectivo Recibido del Cliente
              </label>
              <input
                type="number"
                placeholder="Ej: 100000"
                value={cashReceivedInput}
                onChange={(e) => setCashReceivedInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              />
              {cashGivenNum > 0 && (
                <div className="flex justify-between items-center pt-1 text-xs">
                  <span className="text-slate-400">Cambio (Vueltos):</span>
                  <span
                    className={`font-black ${changeAmount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {changeAmount >= 0
                      ? `$${changeAmount.toLocaleString()}`
                      : "Dinero insuficiente ⚠️"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer">
            Regresar
          </button>
          <button
            disabled={
              isSaving ||
              (paymentMethod === "efectivo" && cashGivenNum < grandTotal)
            }
            onClick={() => onConfirm(grandTotal, calculatedTip, paymentMethod)}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <Check className="w-4 h-4" />
            {isSaving
              ? "Procesando..."
              : `Confirmar Pago de $${grandTotal.toLocaleString()} ✓`}
          </button>
        </div>
      </div>
    </div>
  );
}
