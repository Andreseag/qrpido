import React, { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  trendIcon: ReactNode;
  trendColorClass?: string;
  valueColorClass?: string;
  iconContainerClass?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trendIcon,
  trendColorClass = "text-emerald-500 dark:text-emerald-400",
  valueColorClass = "text-foreground",
  iconContainerClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
}: MetricCardProps) {
  return (
    <div className="bg-surface/90 p-5 sm:p-6 rounded-3xl border border-border shadow-xl flex flex-col justify-between gap-4 transition-all duration-300 hover:border-primary/40 hover:shadow-2xl">
      {/* Cabecera: Título a la izquierda e Icono a la derecha */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </p>
        <div
          className={`p-2.5 sm:p-3 border rounded-2xl shrink-0 ${iconContainerClass}`}>
          {icon}
        </div>
      </div>

      {/* Bloque de Valor Financiero y Subtítulo (Ancho completo asegurado) */}
      <div>
        <p
          className={`text-2xl sm:text-3xl font-black tracking-tight break-words ${valueColorClass}`}>
          {value}
        </p>
        <div
          className={`flex items-center gap-1.5 ${trendColorClass} text-[11px] sm:text-xs font-bold mt-2`}>
          <span className="shrink-0">{trendIcon}</span>
          <span className="truncate">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
