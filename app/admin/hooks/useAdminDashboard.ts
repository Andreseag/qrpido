"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { supabase } from "../../lib/supabase";
import { Order } from "../../types/dashboard";
import { FilterType } from "../../components/AdminDashboard/DashboardFilterBar/DashboardFilterBar";
import { filterOrdersByRange } from "../utils/filterOrders";
import { calculateDashboardMetrics } from "../utils/calculateMetrics";
import { useUserRestaurants } from "./Useuserrestaurants";
import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";

export function useAdminDashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [rawOrders, setRawOrders] = useState<Order[]>([]);

  // Estados de Filtros Pro
  const [filter, setFilter] = useState<FilterType>("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const router = useRouter();

  // Restaurantes donde el usuario es owner
  const {
    restaurants,
    loading: loadingRestaurants,
    error: restaurantsError,
  } = useUserRestaurants(userId);

  // Selección persistida globalmente (Context + localStorage)
  const { selectedRestaurantId, setSelectedRestaurantId } =
    useSelectedRestaurant();

  // 1. Validar sesión
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

  // 2. Resolver el restaurante activo: si solo hay uno, se usa directo;
  // si hay varios, se respeta la selección global (si sigue siendo válida)
  const activeRestaurant = useMemo(() => {
    if (restaurants.length === 1) return restaurants[0];
    if (restaurants.length > 1 && selectedRestaurantId) {
      return restaurants.find((r) => r.id === selectedRestaurantId) || null;
    }
    return null;
  }, [restaurants, selectedRestaurantId]);

  // Si el usuario solo tiene un restaurante, lo fijamos como selección global
  // para que el resto de la app (otras pantallas) lo conozca también.
  useEffect(() => {
    if (
      restaurants.length === 1 &&
      selectedRestaurantId !== restaurants[0].id
    ) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId, setSelectedRestaurantId]);

  const needsSelection = restaurants.length > 1 && !activeRestaurant;

  // 3. Traer las órdenes del restaurante activo
  const fetchOrders = useCallback(async (restaurantId: string) => {
    setLoadingOrders(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setRawOrders((ordersData || []) as Order[]);
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (activeRestaurant) {
      fetchOrders(activeRestaurant.id);
    } else {
      setLoadingOrders(false);
    }
  }, [activeRestaurant, fetchOrders]);

  // Filtrado reactivo con soporte para DateRange de react-day-picker
  const filteredOrders = useMemo(
    () => filterOrdersByRange(rawOrders, filter, dateRange),
    [rawOrders, filter, dateRange],
  );

  // Métricas financieras derivadas de las órdenes filtradas
  const metrics = useMemo(
    () => calculateDashboardMetrics(filteredOrders),
    [filteredOrders],
  );

  const refresh = useCallback(() => {
    if (activeRestaurant) fetchOrders(activeRestaurant.id);
  }, [activeRestaurant, fetchOrders]);

  const restaurantName = loadingRestaurants
    ? "Cargando..."
    : activeRestaurant
      ? activeRestaurant.name
      : restaurants.length === 0
        ? "Sin Restaurante Asignado"
        : "Selecciona un restaurante";

  const loading =
    loadingRestaurants || (Boolean(activeRestaurant) && loadingOrders);

  return {
    loading,
    restaurants,
    restaurantsError,
    needsSelection,
    restaurantName,
    selectRestaurant: setSelectedRestaurantId,
    changeRestaurant: () => setSelectedRestaurantId(null),
    filter,
    setFilter,
    dateRange,
    setDateRange,
    filteredOrders,
    metrics,
    refresh,
  };
}
