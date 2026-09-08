"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Order, OrderState } from "../types";

export function useDeliveryOrders() {
  const [user, setUser] = useState<any>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const router = useRouter();

  // 1. Validar sesión y obtener el ID del restaurante
  useEffect(() => {
    const initDelivery = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: memberData, error } = await supabase
        .from("restaurant_members")
        .select("restaurant_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error || !memberData) {
        setConfigError(
          "No se encontró un restaurante asociado a este usuario.",
        );
        setLoading(false);
        return;
      }

      setRestaurantId(memberData.restaurant_id);
    };

    initDelivery();
  }, [router]);

  // 2. Cargar órdenes de domicilio y activar Supabase Realtime
  useEffect(() => {
    if (!restaurantId) return;

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("order_type", "domicilio")
        .neq("state", "cancelado")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar órdenes de domicilio:", error);
      } else if (data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel(`delivery-channel-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload: any) => {
          const newOrder = payload.new as Order;
          const oldOrder = payload.old as Order;

          if (payload.eventType === "INSERT") {
            if (
              newOrder.order_type === "domicilio" &&
              newOrder.state !== "cancelado"
            ) {
              setOrders((prev) => [newOrder, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            if (
              newOrder.order_type === "domicilio" &&
              newOrder.state !== "cancelado"
            ) {
              setOrders((prev) => {
                const exists = prev.some((o) => o.id === newOrder.id);
                if (exists) {
                  return prev.map((o) => (o.id === newOrder.id ? newOrder : o));
                } else {
                  return [newOrder, ...prev];
                }
              });
            } else {
              // Si cambió de tipo o fue cancelado, lo removemos del tablero de domicilios
              setOrders((prev) => prev.filter((o) => o.id !== newOrder.id));
            }
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== oldOrder.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  // 3. Cambiar estado del pedido
  const updateOrderState = useCallback(
    async (orderId: number, newState: OrderState) => {
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
    },
    [],
  );

  return {
    user,
    orders,
    loading,
    configError,
    updateOrderState,
  };
}
