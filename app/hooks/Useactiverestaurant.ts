"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useUserRestaurants } from "../admin/hooks/Useuserrestaurants";
import { useSelectedRestaurant } from "../context/Selectedrestaurantcontext";

/**
 * Hook compartido para cualquier página de /admin que necesite saber
 * "cuál es el restaurante activo" ahora mismo. Combina:
 * - la lista de restaurantes donde el usuario es owner (useUserRestaurants)
 * - la selección persistida globalmente (useSelectedRestaurant)
 *
 * Reglas de resolución:
 * - 1 solo restaurante  -> se usa directo (y se fija como selección global)
 * - 2+ restaurantes     -> se usa la selección global si sigue siendo válida
 * - 2+ y sin selección  -> needsSelection = true (mostrar el selector)
 * - 0 restaurantes      -> activeRestaurant = null
 */
export function useActiveRestaurant() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);
    };
    checkSession();
  }, [router]);

  const {
    restaurants,
    loading: loadingRestaurants,
    error: restaurantsError,
  } = useUserRestaurants(userId);

  const { selectedRestaurantId, setSelectedRestaurantId } =
    useSelectedRestaurant();

  const activeRestaurant = useMemo(() => {
    if (restaurants.length === 1) return restaurants[0];
    if (restaurants.length > 1 && selectedRestaurantId) {
      return restaurants.find((r) => r.id === selectedRestaurantId) || null;
    }
    return null;
  }, [restaurants, selectedRestaurantId]);

  // Si solo hay un restaurante, lo fijamos como selección global para que
  // el resto de la app (sidebar, otras páginas) lo herede sin fricción.
  useEffect(() => {
    if (
      restaurants.length === 1 &&
      selectedRestaurantId !== restaurants[0].id
    ) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId, setSelectedRestaurantId]);

  const needsSelection = restaurants.length > 1 && !activeRestaurant;

  return {
    userId,
    restaurants,
    loadingRestaurants,
    restaurantsError,
    activeRestaurant,
    needsSelection,
    selectRestaurant: setSelectedRestaurantId,
    changeRestaurant: () => setSelectedRestaurantId(null),
  };
}
