"use client";
import { Check, LayoutList, LayoutGrid, AlignCenter } from "lucide-react";
import { MENU_TEMPLATES, MENU_TEMPLATE_LABELS } from "@/app/lib/menu-palettes";

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  classic: LayoutList,
  grid: LayoutGrid,
  elegant: AlignCenter,
};

export function TemplateSelector({
  selectedId,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-6 space-y-4">
      <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
        Plantilla del Menú
      </h2>
      <div className="space-y-2">
        {MENU_TEMPLATES.map((templateId) => {
          const isSelected = templateId === selectedId;
          const Icon = TEMPLATE_ICONS[templateId];
          const info = MENU_TEMPLATE_LABELS[templateId];
          return (
            <button
              key={templateId}
              onClick={() => onSelect(templateId)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? "bg-primary/10 border-primary"
                  : "bg-background border-border hover:border-border/60"
              }`}>
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground"
                }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">{info.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {info.description}
                </p>
              </div>
              {isSelected && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
