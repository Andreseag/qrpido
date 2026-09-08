"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export type AppRole =
  | "owner"
  | "chef"
  | "cashier"
  | "mesero"
  | "mesera"
  | "waiter";

interface UserRoleData {
  role: AppRole | null;
  restaurantId: number | null;
  restaurantName: string | null;
  loading: boolean;
}

export function useUserRole(): UserRoleData {
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: null,
    restaurantId: null,
    restaurantName: null,
    loading: true,
  });

  useEffect(() => {
    const fetchRoleAndRestaurant = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setRoleData({
            role: null,
            restaurantId: null,
            restaurantName: null,
            loading: false,
          });
          return;
        }

        // Consultamos la tabla restaurant_members unida con restaurants
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
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error || !data) {
          setRoleData({
            role: null,
            restaurantId: null,
            restaurantName: null,
            loading: false,
          });
          return;
        }

        // Manejamos la respuesta de Supabase (puede venir como objeto o array dependiendo de la versión del SDK)
        const restaurant = Array.isArray(data.restaurants)
          ? data.restaurants[0]
          : data.restaurants;

        setRoleData({
          role: data.role as AppRole,
          restaurantId: restaurant?.id || null,
          restaurantName: restaurant?.name || null,
          loading: false,
        });
      } catch (err) {
        console.error("Error al obtener el rol del usuario:", err);
        setRoleData({
          role: null,
          restaurantId: null,
          restaurantName: null,
          loading: false,
        });
      }
    };

    fetchRoleAndRestaurant();
  }, []);

  return roleData;
}
