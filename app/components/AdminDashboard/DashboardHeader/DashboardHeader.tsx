import { LayoutDashboard, CircleDot, RefreshCcw } from "lucide-react";

interface DashboardHeaderProps {
  restaurantName: string;
  onRefresh: () => void;
}

export default function DashboardHeader({
  restaurantName,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
          <LayoutDashboard className="text-amber-400 w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Panel General{" "}
            <span className="text-amber-400 font-medium text-xs px-2.5 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
              Resumen y Finanzas
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Indicadores clave de rendimiento y productos estrella
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-900 px-5 py-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <CircleDot className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-300">
            {restaurantName}
          </span>
        </div>
        <div className="h-4 w-[1px] bg-slate-800"></div>
        <button
          onClick={onRefresh}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Actualizar datos">
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
