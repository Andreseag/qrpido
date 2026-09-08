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
    <div className="relative bg-slate-900/90 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-2xl mb-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 transition-all">
      {/* Botones de Filtros Rápidos */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 scrollbar-none">
        <div className="flex items-center gap-2 text-slate-400 px-2 shrink-0 mr-1">
          <Filter className="w-4 h-4 text-amber-400 animate-pulse" />
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
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.02]"
                  : "bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80"
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
            className="flex items-center justify-between gap-3 bg-slate-950 hover:bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-amber-500/40 text-white text-xs font-bold transition-all shadow-inner w-full xl:w-auto cursor-pointer">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-400" />
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
              className={`w-4 h-4 text-slate-400 transition-transform ${isOpenCalendar ? "rotate-180" : ""}`}
            />
          </button>

          {/* Popover del Calendario Pro */}
          {isOpenCalendar && (
            <div className="absolute right-0 mt-3 z-50 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Selecciona el rango de fechas
                </span>
                <button
                  onClick={() => setIsOpenCalendar(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Estilos personalizados inyectados para adaptar react-day-picker al diseño oscuro/ámbar */}
              <style jsx global>{`
                .rdp {
                  --rdp-cell-size: 38px;
                  --rdp-accent-color: #f59e0b;
                  --rdp-background-color: rgba(245, 158, 11, 0.1);
                  margin: 0;
                }
                .rdp-day_selected:not(.rdp-day_outside) {
                  background-color: #f59e0b !important;
                  color: #020617 !important;
                  font-weight: 900;
                }
                .rdp-day_range_middle {
                  background-color: rgba(245, 158, 11, 0.15) !important;
                  color: #f8fafc !important;
                }
                .rdp-head_cell {
                  color: #94a3b8;
                  font-weight: 800;
                  font-size: 0.7rem;
                }
                .rdp-day {
                  color: #cbd5e1;
                  font-size: 0.8rem;
                  font-weight: 600;
                  border-radius: 100%;
                }
                .rdp-day:hover:not(.rdp-day_selected) {
                  background-color: #1e293b;
                  color: #ffffff;
                }
                .rdp-selected {
                  background-color: #f59e0b !important;
                  color: #020617 !important;
                }
                ..rdp-range_end .rdp-day_button {
                  background-color: #f59e0b !important;
                  color: #020617 !important;
                }
                .rdp-nav_button {
                  color: #cbd5e1;
                }
                .rdp-caption_label {
                  color: #ffffff;
                  font-weight: 900;
                }
              `}</style>

              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={onDateRangeChange}
                locale={es}
                numberOfMonths={1}
                className="text-white"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
