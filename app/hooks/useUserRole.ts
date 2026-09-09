"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type AppRole =
  | "owner"
  | "chef"
  | "cashier"
  | "mesero"
  | "mesera"
  | "waiter"
  | "admin";

export interface RestaurantContext {
  id: number;
  name: string;
  role: AppRole;
}

interface UserRoleData {
  role: AppRole | null;
  restaurantId: number | null;
  restaurantName: string | null;
  restaurants: RestaurantContext[];
  loading: boolean;
  setActiveRestaurant: (id: number) => void;
}

export function useUserRole(): UserRoleData {
  const [restaurants, setRestaurants] = useState<RestaurantContext[]>([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRoleAndRestaurants = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("restaurant_members")
          .select(
            `
            role,
            restaurants (
              id,
              name
            )
          `,
          )
          .eq("user_id", session.user.id);

        if (error || !data || data.length === 0) {
          setLoading(false);
          return;
        }

        // Mapear los datos de Supabase transformando el array recibido
        const mappedRestaurants: RestaurantContext[] = data
          .filter((item: any) => item.restaurants)
          .map((item: any) => ({
            id: item.restaurants.id,
            name: item.restaurants.name,
            role: item.role as AppRole,
          }));

        setRestaurants(mappedRestaurants);

        // Validar si hay una sucursal guardada previamente en localStorage
        const savedId = localStorage.getItem("active_restaurant_id");
        const foundActive = mappedRestaurants.find(
          (r) => r.id.toString() === savedId,
        );

        if (foundActive) {
          setActiveRestaurantId(foundActive.id);
        } else if (mappedRestaurants.length > 0) {
          setActiveRestaurantId(mappedRestaurants[0].id);
          localStorage.setItem(
            "active_restaurant_id",
            mappedRestaurants[0].id.toString(),
          );
        }
      } catch (err) {
        console.error("Error al obtener los roles y restaurantes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndRestaurants();
  }, []);

  // Función para cambiar de sucursal activa en tiempo de ejecución
  const setActiveRestaurant = (id: number) => {
    setActiveRestaurantId(id);
    localStorage.setItem("active_restaurant_id", id.toString());
  };

  // Filtrar los datos correspondientes al restaurante activo actual
  const activeRest =
    restaurants.find((r) => r.id === activeRestaurantId) || restaurants[0];

  return {
    role: activeRest?.role || null,
    restaurantId: activeRest?.id || null,
    restaurantName: activeRest?.name || null,
    restaurants,
    loading,
    setActiveRestaurant,
  };
}
