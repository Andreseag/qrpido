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
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
          <LayoutDashboard className="text-primary w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            Panel General{" "}
            <span className="text-primary font-medium text-xs px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20">
              Resumen y Finanzas
            </span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Indicadores clave de rendimiento y productos estrella
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-surface px-5 py-3 rounded-2xl border border-border">
        <div className="flex items-center gap-2">
          <CircleDot className="w-3 h-3 text-success animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-foreground">
            {restaurantName}
          </span>
        </div>
        <div className="h-4 w-[1px] bg-border"></div>
        <button
          onClick={onRefresh}
          className="p-1 hover:bg-border rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Actualizar datos">
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
