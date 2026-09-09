"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import { RestaurantOption } from "../types/Restaurant";

export function useUserRestaurants(userId: string | null) {
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("restaurant_members")
      .select("role, restaurants (id, name)")
      .eq("user_id", uid)
      .eq("role", "owner");

    if (error) {
      setError(error.message);
      setRestaurants([]);
      setLoading(false);
      return;
    }

    const list: RestaurantOption[] = (data || [])
      .map((member: any) => {
        const restaurant = Array.isArray(member.restaurants)
          ? member.restaurants[0]
          : member.restaurants;
        return restaurant
          ? { id: String(restaurant.id), name: restaurant.name }
          : null;
      })
      .filter((r): r is RestaurantOption => r !== null);

    setRestaurants(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchRestaurants(userId);
  }, [userId, fetchRestaurants]);

  return { restaurants, loading, error, refetch: fetchRestaurants };
}
