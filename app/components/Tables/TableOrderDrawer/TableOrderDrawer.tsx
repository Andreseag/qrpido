"use client";
import { useState, useEffect } from "react";
import { X, Layers, Minus, Plus, Check, ArrowRight } from "lucide-react";
import {
  ActiveOrder,
  OrderItem,
  Product,
  Table,
} from "@/app/admin/tables/types";

interface TableOrderDrawerProps {
  isOpen: boolean;
  table: Table | null;
  tableOrders: ActiveOrder[];
  products: Product[];
  isSaving: boolean;
  onClose: () => void;
  onSendRound: (cart: OrderItem[], note: string) => Promise<boolean> | boolean;
  onOpenPayment: () => void;
}

export function TableOrderDrawer({
  isOpen,
  table,
  tableOrders,
  products,
  isSaving,
  onClose,
  onSendRound,
  onOpenPayment,
}: TableOrderDrawerProps) {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCart([]);
      setNote("");
    }
  }, [isOpen, table?.id]);

  if (!isOpen || !table) return null;

  const addProduct = (product: Product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.name === product.name,
      );
      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        { name: product.name, price: product.price, quantity: 1 },
      ];
    });
  };

  const removeItem = (index: number) => {
    setCart((prev) => {
      const currentItem = prev[index];
      if (currentItem.quantity > 1) {
        return prev.map((item, idx) =>
          idx === index ? { ...item, quantity: item.quantity - 1 } : item,
        );
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSend = async () => {
    const success = await onSendRound(cart, note);
    if (success) {
      setCart([]);
      setNote("");
    }
  };

  const accumulatedTotal =
    tableOrders.reduce((sum, o) => sum + o.total_price, 0) +
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                Administración de Cuenta por Rondas
              </span>
              <h2 className="text-xl font-black text-white">
                Mesa #{table.number}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" /> Rondas enviadas a
              cocina / Historial
            </h3>
            {tableOrders.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                No hay rondas activas en esta mesa todavía.
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {tableOrders.map((order, idx) => (
                  <div
                    key={order.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">
                          Ronda #{idx + 1}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                            order.state === "pendiente"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : order.state === "listo"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                          Estado Cocina: {order.state}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {order.items
                          ?.map((i) => `${i.quantity}x ${i.name}`)
                          .join(", ")}
                      </p>
                      {order.note && (
                        <p className="text-[10px] text-amber-300/80 italic mt-0.5">
                          Nota: {order.note}
                        </p>
                      )}
                    </div>
                    <span className="font-black text-amber-400 text-sm">
                      ${order.total_price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-5">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col h-[260px]">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2 flex items-center justify-between">
                <span>Nueva Adición (Pedido Extra)</span>
                <span>
                  {cart.reduce((acc, i) => acc + i.quantity, 0)} items
                </span>
              </h3>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {cart.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs italic py-12">
                    Selecciona productos del menú de la derecha para agregar a
                    esta nueva ronda.
                  </p>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="truncate pr-2">
                        <p className="text-xs font-bold text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-amber-400">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-slate-300 w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => removeItem(idx)}
                          className="w-6 h-6 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Nota para esta ronda (ej: Extra salsa)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col h-[260px]">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                Menú Disponible
              </h3>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {products.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs italic py-12">
                    No hay productos en el menú.
                  </p>
                ) : (
                  products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => addProduct(prod)}
                      className="flex items-center justify-between bg-slate-900 hover:bg-slate-800/80 p-2 rounded-xl border border-slate-800 transition-all cursor-pointer group">
                      <div className="truncate pr-2">
                        <p className="text-xs font-bold text-white group-hover:text-amber-400 truncate">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          ${prod.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-6 h-6 bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 rounded-lg flex items-center justify-center transition-all shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-sm font-black text-white px-1">
            <span>Total Acumulado de la Mesa:</span>
            <span className="text-amber-400 text-base">
              ${accumulatedTotal.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={isSaving || cart.length === 0}
              onClick={handleSend}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 py-3 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              {isSaving ? "Enviando..." : "Enviar Adición 🚀"}
            </button>

            {tableOrders.length > 0 && (
              <button
                onClick={onOpenPayment}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5">
                <span>Ir a Cobrar POS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
