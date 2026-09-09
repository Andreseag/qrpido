"use client";

import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";
import { supabase } from "@/app/lib/supabase";
import { useEffect, useState, useCallback } from "react";

export function useCampaigns() {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "inactive" | "frequent">(
    "inactive",
  );
  const [customPromo, setCustomPromo] = useState(
    "¡Tenemos un 10% de descuento en tu próximo pedido si pides hoy! 🍔🔥",
  );
  const [sentLog, setSentLog] = useState<{ [id: string]: boolean }>({});

  // Selección persistida globalmente (Context + localStorage)
  const { selectedRestaurantId } = useSelectedRestaurant();

  const fetchData = useCallback(async () => {
    if (!selectedRestaurantId) {
      setLoading(false);
      setCustomers([]);
      return;
    }

    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // Obtener clientes
    const { data: customersData } = await supabase
      .from("customers")
      .select("*")
      .eq("restaurant_id", selectedRestaurantId)
      .order("created_at", { ascending: false });

    // Obtener órdenes
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, customer_id, created_at, total_price, items")
      .eq("restaurant_id", selectedRestaurantId);

    if (customersData && ordersData) {
      const now = new Date().getTime();

      const processed: CustomerStats[] = customersData.map((c) => {
        const cOrders = ordersData.filter((o) => o.customer_id === c.id);
        cOrders.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        const lastOrder = cOrders[0];
        let daysSince = 999;
        if (lastOrder) {
          const lastTime = new Date(lastOrder.created_at).getTime();
          daysSince = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));
        }

        // Calcular plato favorito
        const itemCounts: { [name: string]: number } = {};
        cOrders.forEach((order) => {
          order.items?.forEach((item: any) => {
            itemCounts[item.name] =
              (itemCounts[item.name] || 0) + item.quantity;
          });
        });
        let topItem = "tu plato favorito";
        let maxQty = 0;
        Object.entries(itemCounts).forEach(([name, qty]) => {
          if (qty > maxQty) {
            maxQty = qty;
            topItem = name;
          }
        });

        return {
          id: c.id,
          name: c.name || "Cliente sin nombre",
          phone: c.phone || "",
          lastOrderDate: lastOrder ? lastOrder.created_at : null,
          daysSinceLastOrder: daysSince,
          totalOrders: cOrders.length,
          favoriteDish: topItem,
        };
      });

      setCustomers(processed);
    }
    setLoading(false);
  }, [selectedRestaurantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendCampaign = (customer: CustomerStats) => {
    const cleanPhone = customer.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      alert("Este cliente no tiene un número de teléfono válido.");
      return;
    }

    const message = `¡Hola ${customer.name}! 👋 Qué gusto saludarte de nuevo. Notamos que extrañas ${customer.favoriteDish}. ${customPromo} Escríbenos por aquí con un clic y te lo preparamos de inmediato. 🛵💨`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    setSentLog((prev) => ({ ...prev, [customer.id]: true }));
  };

  const filteredCustomers = customers.filter((c) => {
    if (filterType === "inactive")
      return c.daysSinceLastOrder >= 7 || c.totalOrders === 0;
    if (filterType === "frequent") return c.totalOrders >= 3;
    return true;
  });

  return {
    setFilterType,
    filterType,
    customers,
    customPromo,
    setCustomPromo,
    filteredCustomers,
    loading,
    sentLog,
    handleSendCampaign,
    restaurantId: selectedRestaurantId,
  };
}
