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
    <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-950/30">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
        Restaurante Activo
      </label>
      <div className="relative">
        <select
          value={selectedRestaurantId ?? ""}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          className="w-full appearance-none bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-white text-sm font-bold rounded-xl pl-9 pr-8 py-2.5 cursor-pointer focus:outline-none focus:border-amber-500 transition-colors">
          {restaurants.map((r) => (
            <option key={r.id} value={r.id} className="bg-slate-900 text-white">
              {r.name}
            </option>
          ))}
        </select>
        <Store className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
