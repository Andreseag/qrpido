"use client";
import { Building2 } from "lucide-react";

interface RestaurantInfoFormProps {
  restaurantName: string;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export function RestaurantInfoForm({
  restaurantName,
  onNameChange,
  onSubmit,
  saving,
}: RestaurantInfoFormProps) {
  return (
    <div className="bg-surface border border-border p-6 rounded-3xl shadow-xl space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Building2 className="text-primary w-5 h-5" />
        <h2 className="text-base font-bold text-foreground">
          Información General
        </h2>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Nombre del Restaurante
          </label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => onNameChange(e.target.value)}
            required
            className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary transition"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl transition shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer">
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
