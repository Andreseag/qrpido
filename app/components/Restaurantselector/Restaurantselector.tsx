"use client";
import { RestaurantOption } from "@/app/admin/types/Restaurant";
import { Store, ChevronRight } from "lucide-react";

interface RestaurantSelectorProps {
  restaurants: RestaurantOption[];
  onSelect: (id: string) => void;
}

export default function RestaurantSelector({
  restaurants,
  onSelect,
}: RestaurantSelectorProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 inline-flex mb-4">
            <Store className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-foreground mb-1">
            Selecciona un Restaurante
          </h1>
          <p className="text-xs text-muted-foreground">
            Administras más de un restaurante. Elige cuál quieres ver.
          </p>
        </div>

        <div className="space-y-3">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => onSelect(restaurant.id)}
              className="w-full bg-surface border border-border hover:border-primary/50 hover:bg-surface/80 rounded-2xl p-5 flex items-center justify-between transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 text-primary">
                  <Store className="w-5 h-5" />
                </div>
                <span className="font-bold text-foreground text-sm">
                  {restaurant.name}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
