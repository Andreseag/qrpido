import {
  Clock,
  MapPin,
  Bike,
  CheckCircle2,
  XCircle,
  ChefHat,
  MessageSquare,
  User,
} from "lucide-react";
import { Order, OrderState } from "../types";
import { getElapsedTime } from "../utils";

interface OrderCardProps {
  order: Order;
  onUpdateState: (orderId: number, newState: OrderState) => void;
}

export function OrderCard({ order, onUpdateState }: OrderCardProps) {
  const elapsedMins = getElapsedTime(order.created_at);
  const isDelayed = elapsedMins > 30 && order.state !== "entregado";
  const vuelto =
    order.cash_given && order.cash_given > order.total_price
      ? order.cash_given - order.total_price
      : 0;

  const handleCancel = () => {
    if (confirm("¿Estás seguro de cancelar este pedido?")) {
      onUpdateState(order.id, "cancelado");
    }
  };

  return (
    <div
      className={`bg-slate-950 border rounded-xl p-3.5 shadow-lg relative transition-all ${
        isDelayed
          ? "border-red-500/60 bg-red-950/10"
          : "border-slate-800/80 hover:border-slate-700"
      }`}>
      {/* Indicador de tiempo y tipo */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-900">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-purple-500/15 text-purple-300 border border-purple-500/30">
          <MapPin className="w-3 h-3" /> Domicilio
        </span>

        <div
          className={`flex items-center gap-1 text-[10px] font-mono font-bold ${
            isDelayed ? "text-red-400 animate-pulse" : "text-slate-400"
          }`}>
          <Clock className="w-3 h-3" /> {elapsedMins} min
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="mb-3">
        <h3 className="font-bold text-white text-xs flex items-center gap-1">
          <User className="w-3 h-3 text-slate-400" />{" "}
          {order.customer_name || `Orden #${order.id}`}
        </h3>
        {order.customer_phone && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-400 font-mono">
              {order.customer_phone}
            </span>
            <a
              href={`https://wa.me/57${order.customer_phone}?text=Hola%20${encodeURIComponent(
                order.customer_name || "Cliente",
              )},%20te%20escribimos%20de%20nuestro%20restaurante%20sobre%20tu%20pedido.`}
              target="_blank"
              rel="noreferrer"
              className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
              title="Abrir WhatsApp">
              <MessageSquare className="w-3 h-3" />
            </a>
          </div>
        )}
        {order.address && (
          <p className="text-[11px] text-slate-300 mt-1 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
            📍 {order.address}
          </p>
        )}
      </div>

      {/* Productos del pedido */}
      <div className="space-y-1 mb-3 bg-slate-900/40 p-2 rounded-xl border border-slate-900">
        {order.items &&
          order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-[11px]">
              <span className="text-slate-300">
                <strong className="text-amber-400 font-mono">
                  {item.quantity}x
                </strong>{" "}
                {item.name}
              </span>
              <span className="text-slate-400 font-mono">
                ${(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
      </div>

      {/* Info de pago y total */}
      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 mb-3 text-[11px] space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400 uppercase font-bold text-[9px]">
            Pago: {order.payment_method || "efectivo"}
          </span>
          <span className="font-black text-amber-400">
            Total: ${order.total_price.toLocaleString()}
          </span>
        </div>
        {order.payment_method === "efectivo" && order.cash_given && (
          <div className="flex justify-between text-emerald-400 font-bold text-[10px] pt-1 border-t border-slate-800">
            <span>Paga con: ${order.cash_given.toLocaleString()}</span>
            <span>Vueltas: ${vuelto.toLocaleString()}</span>
          </div>
        )}
      </div>

      {order.note && (
        <p className="text-[10px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-1.5 rounded-lg mb-3 italic">
          Nota: {order.note}
        </p>
      )}

      {/* Botones de avance de estado */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900">
        {order.state === "pendiente" && (
          <button
            onClick={() => onUpdateState(order.id, "en_cocina")}
            className="w-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer">
            <ChefHat className="w-3 h-3" /> A Cocina
          </button>
        )}

        {order.state === "en_cocina" && (
          <button
            onClick={() => onUpdateState(order.id, "listo")}
            className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer">
            <CheckCircle2 className="w-3 h-3" /> Marcar Listo
          </button>
        )}

        {order.state === "listo" && (
          <button
            onClick={() => onUpdateState(order.id, "en_camino")}
            className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer">
            <Bike className="w-3 h-3" /> Enviar (En Camino)
          </button>
        )}

        {order.state === "en_camino" && (
          <button
            onClick={() => onUpdateState(order.id, "entregado")}
            className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer">
            <CheckCircle2 className="w-3 h-3" /> Entregado
          </button>
        )}

        {order.state !== "entregado" && (
          <button
            onClick={handleCancel}
            className="p-1.5 bg-slate-900 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg border border-slate-800 transition-colors cursor-pointer"
            title="Cancelar pedido">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
