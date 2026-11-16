"use client";

import { useRef } from "react";
import { LayoutDashboard, Printer, X } from "lucide-react";

interface PrintTicketProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    table_number?: number | string;
    customer_name?: string;
    order_type: "mesa" | "domicilio";
    created_at: string;
    items: Array<{
      quantity: number;
      name: string;
      notes?: string;
      price?: number;
    }>;
    total_price: number;
  } | null;
}

export function PrintTicket({ isOpen, onClose, order }: PrintTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Cabecera del Modal (Visible en Pantalla, Oculta al Imprimir) */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50 print:hidden">
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <Printer className="w-4 h-4 text-primary" /> Vista Previa de
            Impresión
          </h3>
          <button
            onClick={onClose}
            className="bg-background/80 hover:bg-background text-foreground p-1.5 rounded-full border border-border">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* --- CONTENIDO DEL TICKET (Diseño Térmico 80mm) --- */}
        <div
          className="p-6 overflow-y-auto flex-1 bg-white text-black font-mono text-xs space-y-4 print:p-0 print:m-0 print:w-[80mm]"
          ref={ticketRef}>
          {/* Encabezado del Local */}
          <div className="text-center space-y-0.5 border-b border-black/20 pb-3">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl mb-4 shadow-lg shadow-primary/10">
                <LayoutDashboard className="text-primary w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-black tracking-tight">
                QRPido
              </h1>
            </div>
            <p className="text-[10px]">Restaurante & Bar</p>
            <p className="text-[10px] text-gray-600">NIT: 900.000.000-1</p>
          </div>

          {/* Info del Turno / Orden */}
          <div className="space-y-1 text-[11px] border-b border-black/20 pb-3">
            <div className="flex justify-between">
              <span>Tipo:</span>
              <span className="font-bold uppercase">{order.order_type}</span>
            </div>
            <div className="flex justify-between">
              <span>{order.order_type === "mesa" ? "Mesa:" : "Cliente:"}</span>
              <span className="font-bold">
                {order.order_type === "mesa"
                  ? `#${order.table_number}`
                  : order.customer_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>{new Date(order.created_at).toLocaleString("es-CO")}</span>
            </div>
            <div className="flex justify-between">
              <span>Orden ID:</span>
              <span>#{String(order?.id || "").slice(0, 6)}</span>
            </div>
          </div>

          {/* Listado de Productos */}
          <div className="space-y-2 border-b border-black/20 pb-3">
            <div className="flex justify-between font-bold border-b border-black/10 pb-1 text-[10px] uppercase">
              <span>Cant / Plato</span>
              <span>Total</span>
            </div>

            {order.items?.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-start">
                  <span className="font-bold">
                    {item.quantity}x {item.name}
                  </span>
                  <span>
                    $
                    {(Number(item.price || 0) * item.quantity).toLocaleString(
                      "es-CO",
                    )}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-[10px] italic text-gray-600 pl-4">
                    ⚠️ Nota: {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Total a Pagar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-sm font-black">
              <span>TOTAL A PAGAR:</span>
              <span>
                ${Number(order.total_price || 0).toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* Pie del Ticket */}
          <div className="text-center pt-4 border-t border-black/20 space-y-1 text-[10px]">
            <p className="font-bold">¡Gracias por su compra!</p>
            <p className="text-gray-500">Control operado por Castro Labs</p>
          </div>
        </div>

        {/* Botones de Acción (Visibles en Pantalla, Ocultos al Imprimir) */}
        <div className="p-4 border-t border-border bg-surface/50 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground">
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black flex items-center gap-2 hover:opacity-95 shadow-md">
            <Printer className="w-4 h-4" /> Imprimir Comanda
          </button>
        </div>
      </div>

      {/* --- ESTILOS CSS GLOBALES DE IMPRESIÓN --- */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed,
          .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: white !important;
          }
          .print\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
