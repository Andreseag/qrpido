import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface MonthNavigatorProps {
  year: number;
  month: number; // 0-indexado
  onPrevious: () => void;
  onNext: () => void;
}

export function MonthNavigator({
  year,
  month,
  onPrevious,
  onNext,
}: MonthNavigatorProps) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-2.5">
      <button
        onClick={onPrevious}
        className="p-1.5 hover:bg-surface/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-xs font-black text-foreground uppercase tracking-wider w-32 text-center">
        {MONTH_NAMES[month]} {year}
      </span>
      <button
        onClick={onNext}
        className="p-1.5 hover:bg-surface/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
