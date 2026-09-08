import { Bike } from "lucide-react";

interface DeliveryHeaderProps {
  orderCount: number;
}

export function DeliveryHeader({ orderCount }: DeliveryHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
          <Bike className="text-amber-400 w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Tablero de Domicilios{" "}
            <span className="text-amber-400 font-medium text-xs px-2.5 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
              Kanban Live
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Gestión en tiempo real exclusiva para pedidos de domicilio
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-900 px-5 py-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            Sincronizado
          </span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl">
          {orderCount} Domicilios
        </span>
      </div>
    </header>
  );
}
