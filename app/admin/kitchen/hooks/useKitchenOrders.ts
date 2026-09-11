"use client";

import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  items: OrderItem[];
  state: "en_cocina" | "preparando" | "listo" | "entregado" | "pendiente";
  order_type?: "mesa" | "llevar" | "domicilio" | string;
  table_id?: number | null;
  table_number?: string | null;
  address?: string | null;
  payment_method?: string | null;
  cash_given?: number | null;
  restaurant_id: number;
  total_price: number;
  note?: string | null;
}

export function useKitchenOrders() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const router = useRouter();

  // Selección persistida globalmente (Context + localStorage)
  const { selectedRestaurantId } = useSelectedRestaurant();

  // 1. Validar sesión al montar
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
    };

    checkSession();
  }, [router]);

  // 2. Cargar órdenes y activar Supabase Realtime según el restaurante seleccionado
  useEffect(() => {
    if (!selectedRestaurantId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", selectedRestaurantId)
        .in("state", ["en_cocina", "preparando"])
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error al cargar órdenes:", error);
        setConfigError("Error al cargar las órdenes del restaurante.");
      } else if (data) {
        setOrders(data as Order[]);
        setConfigError(null);
      }
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel(`kitchen-channel-${selectedRestaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${selectedRestaurantId}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [...prev, payload.new as Order]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) => {
              const updated = payload.new as Order;
              if (["listo", "entregado"].includes(updated.state)) {
                return prev.filter((o) => o.id !== updated.id);
              }
              return prev.map((o) => (o.id === updated.id ? updated : o));
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRestaurantId]);

  // 3. Cambiar estado del pedido
  const updateOrderState = async (
    orderId: number,
    newState: "preparando" | "listo",
  ) => {
    const { error } = await supabase
      .from("orders")
      .update({ state: newState })
      .eq("id", orderId);

    if (error) {
      console.error("Error al actualizar estado:", error);
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, state: newState } : o)),
      );
    }
  };

  const getElapsedTime = (createdAt: string) => {
    return Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / 60000,
    );
  };

  return {
    user,
    restaurantId: selectedRestaurantId,
    orders,
    loading,
    configError,
    updateOrderState,
    getElapsedTime,
  };
}
