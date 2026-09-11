"use client";
import { useUserRestaurants } from "@/app/admin/hooks/Useuserrestaurants";
import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";
import { Store, ChevronDown } from "lucide-react";

interface RestaurantSwitcherProps {
  userId: string | null;
}

export default function RestaurantSwitcher({
  userId,
}: RestaurantSwitcherProps) {
  const { restaurants, loading } = useUserRestaurants(userId);
  const { selectedRestaurantId, setSelectedRestaurantId } =
    useSelectedRestaurant();

  // Si todavía está cargando, no hay restaurantes, o solo hay uno,
  // no hay nada que "cambiar" — no mostramos el select.
  if (loading || restaurants.length <= 1) return null;

  return (
    <div className="px-6 py-3 border-b border-border/60 bg-background/30">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
        Restaurante Activo
      </label>
      <div className="relative">
        <select
          value={selectedRestaurantId ?? ""}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          className="w-full appearance-none bg-surface border border-border hover:border-primary/40 text-foreground text-sm font-bold rounded-xl pl-9 pr-8 py-2.5 cursor-pointer focus:outline-none focus:border-primary transition-colors">
          {restaurants.map((r) => (
            <option
              key={r.id}
              value={r.id}
              className="bg-surface text-foreground">
              {r.name}
            </option>
          ))}
        </select>
        <Store className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
