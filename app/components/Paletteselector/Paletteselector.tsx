"use client";
import { Check } from "lucide-react";
import { MENU_PALETTES } from "@/app/lib/menu-palettes";

interface PaletteSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PaletteSelector({
  selectedId,
  onSelect,
}: PaletteSelectorProps) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-6 space-y-4">
      <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
        Paleta de Colores
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {MENU_PALETTES.map((palette) => {
          const isSelected = palette.id === selectedId;
          return (
            <button
              key={palette.id}
              onClick={() => onSelect(palette.id)}
              className={`relative flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                isSelected
                  ? "border-primary"
                  : "border-border hover:border-border/60"
              }`}
              style={{ backgroundColor: palette.background }}>
              <div
                className="w-8 h-8 rounded-full shrink-0 border"
                style={{
                  backgroundColor: palette.primary,
                  borderColor: palette.border,
                }}
              />
              <span
                className="text-xs font-bold truncate"
                style={{ color: palette.foreground }}>
                {palette.name}
              </span>
              {isSelected && (
                <span className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
