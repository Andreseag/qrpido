"use client";

import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";
import { supabase } from "@/app/lib/supabase";
import { useEffect, useState, useCallback } from "react";

export function useClients() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Selección persistida globalmente (Context + localStorage)
  const { selectedRestaurantId } = useSelectedRestaurant();

  const fetchCustomers = useCallback(async () => {
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

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("restaurant_id", selectedRestaurantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar clientes:", error);
    } else if (data) {
      setCustomers(data);
    }
    setLoading(false);
  }, [selectedRestaurantId]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm),
  );

  return {
    loading,
    searchTerm,
    setSearchTerm,
    selectedCustomer,
    setSelectedCustomer,
    restaurantId: selectedRestaurantId,
    filteredCustomers,
  };
}
