"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Order, OrderState } from "../types";
import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";

export function useDeliveryOrders() {
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

  // 2. Cargar órdenes de domicilio y activar Supabase Realtime según el restaurante seleccionado
  useEffect(() => {
    if (!selectedRestaurantId) {
      setLoading(false);
      setOrders([]);
      setConfigError(null);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", selectedRestaurantId)
        .eq("order_type", "domicilio")
        .neq("state", "cancelado")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar órdenes de domicilio:", error);
        setConfigError("Error al cargar las órdenes de domicilio.");
      } else if (data) {
        setOrders(data as Order[]);
        setConfigError(null);
      }
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel(`delivery-channel-${selectedRestaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${selectedRestaurantId}`,
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
  }, [selectedRestaurantId]);

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
    restaurantId: selectedRestaurantId,
    orders,
    loading,
    configError,
    updateOrderState,
  };
}
