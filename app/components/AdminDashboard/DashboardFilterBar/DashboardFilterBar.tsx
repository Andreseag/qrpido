"use client";
import { useState, useRef, useEffect } from "react";
import { Filter, Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

export type FilterType = "day" | "week" | "month" | "all" | "custom";

interface DashboardFilterBarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export default function DashboardFilterBar({
  currentFilter,
  onFilterChange,
  dateRange,
  onDateRangeChange,
}: DashboardFilterBarProps) {
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const filters: { id: FilterType; label: string }[] = [
    { id: "day", label: "Último Día" },
    { id: "week", label: "Última Semana" },
    { id: "month", label: "Último Mes" },
    { id: "all", label: "Histórico" },
    { id: "custom", label: "Rango Personalizado" },
  ];

  // Cerrar el calendario si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpenCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterClick = (id: FilterType) => {
    onFilterChange(id);
    if (id === "custom") {
      setIsOpenCalendar(true);
    } else {
      setIsOpenCalendar(false);
    }
  };

  return (
    <div className="relative bg-surface/90 backdrop-blur-md p-4 rounded-3xl border border-border shadow-xl mb-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 transition-all">
      {/* Botones de Filtros Rápidos */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 scrollbar-none">
        <div className="flex items-center gap-2 text-muted-foreground px-2 shrink-0 mr-1">
          <Filter className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider">
            Período:
          </span>
        </div>
        {filters.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => handleFilterClick(f.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                  : "bg-background/60 text-muted-foreground hover:text-foreground hover:bg-border/80 border border-border/80"
              }`}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Botón activador del Rango Personalizado */}
      {currentFilter === "custom" && (
        <div className="relative w-full xl:w-auto" ref={calendarRef}>
          <button
            onClick={() => setIsOpenCalendar(!isOpenCalendar)}
            className="flex items-center justify-between gap-3 bg-background hover:bg-background/80 px-4 py-2.5 rounded-2xl border border-primary/40 text-foreground text-xs font-bold transition-all shadow-inner w-full xl:w-auto cursor-pointer">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span>
                {dateRange?.from
                  ? format(dateRange.from, "dd MMM yyyy", { locale: es })
                  : "Desde"}
                {" → "}
                {dateRange?.to
                  ? format(dateRange.to, "dd MMM yyyy", { locale: es })
                  : "Hasta"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${isOpenCalendar ? "rotate-180" : ""}`}
            />
          </button>

          {/* Popover del Calendario Pro */}
          {isOpenCalendar && (
            <div className="absolute right-0 mt-3 z-50 bg-surface border border-border rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Selecciona el rango de fechas
                </span>
                <button
                  onClick={() => setIsOpenCalendar(false)}
                  className="p-1 hover:bg-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/*
                Estilos personalizados para react-day-picker.
                No es Tailwind, así que usamos las variables CSS crudas
                (var(--primary), var(--foreground)...) — son las mismas
                que alimentan los tokens de Tailwind por debajo, así que
                esto también reacciona al cambio de tema y a que ajustes
                la paleta en :root/.dark más adelante.

                Nota: la regla ..rdp-range_end tenía un punto doble en el
                original (selector CSS inválido, el navegador la ignoraba
                silenciosamente) — la corregí de paso.
              */}
              <style jsx global>{`
                .rdp {
                  --rdp-cell-size: 38px;
                  --rdp-accent-color: var(--primary);
                  --rdp-background-color: color-mix(
                    in srgb,
                    var(--primary) 10%,
                    transparent
                  );
                  margin: 0;
                }
                .rdp-day_selected:not(.rdp-day_outside) {
                  background-color: var(--primary) !important;
                  color: var(--primary-foreground) !important;
                  font-weight: 900;
                }
                .rdp-day_range_middle {
                  background-color: color-mix(
                    in srgb,
                    var(--primary) 15%,
                    transparent
                  ) !important;
                  color: var(--foreground) !important;
                }
                .rdp-head_cell {
                  color: var(--muted-foreground);
                  font-weight: 800;
                  font-size: 0.7rem;
                }
                .rdp-day {
                  color: var(--foreground);
                  font-size: 0.8rem;
                  font-weight: 600;
                  border-radius: 100%;
                }
                .rdp-day:hover:not(.rdp-day_selected) {
                  background-color: var(--border);
                  color: var(--foreground);
                }
                .rdp-selected {
                  background-color: var(--primary) !important;
                  color: var(--primary-foreground) !important;
                }
                .rdp-range_end .rdp-day_button {
                  background-color: var(--primary) !important;
                  color: var(--primary-foreground) !important;
                }
                .rdp-nav_button {
                  color: var(--muted-foreground);
                }
                .rdp-caption_label {
                  color: var(--foreground);
                  font-weight: 900;
                }
              `}</style>

              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={onDateRangeChange}
                locale={es}
                numberOfMonths={1}
                className="text-foreground"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
