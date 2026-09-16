import { Bike } from "lucide-react";

interface DeliveryHeaderProps {
  orderCount: number;
}

export function DeliveryHeader({ orderCount }: DeliveryHeaderProps) {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
      {/* Sección Izquierda: Icono y Títulos */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <div className="bg-primary/10 p-2.5 sm:p-3 rounded-2xl border border-primary/20 shrink-0">
          <Bike className="text-primary w-6 h-6 sm:w-8 sm:h-8" />
        </div>

        <div className="space-y-1">
          {/* Título y Badge con protección de envoltura flexible */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Tablero de Domicilios
            </h1>
            <span className="text-primary font-medium text-[10px] sm:text-xs px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20 tracking-wider">
              Kanban Live
            </span>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            Gestión en tiempo real exclusiva para pedidos de domicilio
          </p>
        </div>
      </div>

      {/* Sección Derecha: Indicador de Sincronización y Conteo */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 bg-surface px-4 sm:px-5 py-3 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Sincronizado
          </span>
        </div>
        <div className="h-4 w-[1px] bg-border"></div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-xl shrink-0">
          {orderCount} Domicilios
        </span>
      </div>
    </header>
  );
}
