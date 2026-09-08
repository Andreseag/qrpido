"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, ShoppingBag, TrendingUp, ReceiptText } from "lucide-react";
import { DateRange } from "react-day-picker";
import DashboardFilterBar, {
  FilterType,
} from "../components/AdminDashboard/DashboardFilterBar/DashboardFilterBar";
import { supabase } from "../lib/supabase";
import DashboardHeader from "../components/AdminDashboard/DashboardHeader/DashboardHeader";
import MetricCard from "../components/AdminDashboard/MetricCard/MetricCard";
import TopProductsCard from "../components/AdminDashboard/TopProductsCard/TopProductsCard";
import RecentOrdersCard from "../components/AdminDashboard/RecentOrdersCard/RecentOrdersCard";
import { Order, TopProduct } from "../types/dashboard";
import { RoleGuard } from "../components/Auth/RoleGuard/RoleGuard";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("Cargando...");
  const [rawOrders, setRawOrders] = useState<Order[]>([]);

  // Estados de Filtros Pro
  const [filter, setFilter] = useState<FilterType>("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      await fetchDashboardData(session.user.id);
    };
    checkUserAndFetch();
  }, [router]);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      const { data: restaurant, error: restError } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("owner_id", userId)
        .maybeSingle();

      if (restError || !restaurant) {
        setRestaurantName("Sin Restaurante Asignado");
        setLoading(false);
        return;
      }

      setRestaurantName(restaurant.name);

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setRawOrders((ordersData || []) as Order[]);
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado reactivo con soporte para DateRange de react-day-picker
  const filteredOrders = useMemo(() => {
    if (!rawOrders.length) return [];
    const now = new Date();

    return rawOrders.filter((order) => {
      const orderDate = new Date(order.created_at);

      if (filter === "day") {
        const twentyFourHoursAgo = new Date(
          now.getTime() - 24 * 60 * 60 * 1000,
        );
        return orderDate >= twentyFourHoursAgo;
      }
      if (filter === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= oneWeekAgo;
      }
      if (filter === "month") {
        const oneMonthAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
        return orderDate >= oneMonthAgo;
      }
      if (filter === "custom") {
        if (!dateRange?.from) return true;
        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);

        const end = dateRange.to
          ? new Date(dateRange.to)
          : new Date(dateRange.from);
        end.setHours(23, 59, 59, 999);

        return orderDate >= start && orderDate <= end;
      }
      return true; // "all"
    });
  }, [rawOrders, filter, dateRange]);

  // (El resto de cálculos de métricas y return se mantiene exactamente igual...)
  const {
    totalRevenue,
    totalOrdersCount,
    averageTicket,
    totalNetProfit,
    topProducts,
  } = useMemo(() => {
    let revenue = 0;
    let netProfit = 0;
    const count = filteredOrders.length;
    const productMap: { [key: string]: { quantity: number; revenue: number } } =
      {};

    filteredOrders.forEach((order) => {
      revenue += Number(order.total_price) || 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const itemName = item.name || "Producto sin nombre";
          const qty = Number(item.quantity) || 1;
          const itemRevenue = (Number(item.price) || 0) * qty;
          const itemCost = (Number(item.cost) || 0) * qty;

          netProfit += itemRevenue - itemCost;

          if (!productMap[itemName]) {
            productMap[itemName] = { quantity: 0, revenue: 0 };
          }
          productMap[itemName].quantity += qty;
          productMap[itemName].revenue += itemRevenue;
        });
      }
    });

    const avg = count > 0 ? revenue / count : 0;

    const sortedProducts: TopProduct[] = Object.keys(productMap)
      .map((name) => ({
        name,
        quantity: productMap[name].quantity,
        revenue: productMap[name].revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalRevenue: revenue,
      totalOrdersCount: count,
      averageTicket: avg,
      totalNetProfit: netProfit,
      topProducts: sortedProducts,
    };
  }, [filteredOrders]);

  return (
    <RoleGuard allowedRoles={["owner"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <DashboardHeader
            restaurantName={restaurantName}
            onRefresh={() => user && fetchDashboardData(user.id)}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
              <p className="text-amber-400 font-black tracking-widest uppercase text-xs">
                Cargando métricas financieras...
              </p>
            </div>
          ) : (
            <>
              <DashboardFilterBar
                currentFilter={filter}
                onFilterChange={setFilter}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />

              {/* Tarjetas de Métricas Financieras */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <MetricCard
                  title="Ventas Totales"
                  value={`$${totalRevenue.toLocaleString()}`}
                  subtitle="Ingresos del período"
                  icon={<DollarSign className="w-7 h-7" />}
                  trendIcon={<TrendingUp size={14} />}
                  trendColorClass="text-emerald-400"
                  iconContainerClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                />

                <MetricCard
                  title="Total Pedidos"
                  value={totalOrdersCount}
                  subtitle="Órdenes en el período"
                  icon={<ReceiptText className="w-7 h-7" />}
                  trendIcon={<ShoppingBag size={14} />}
                  trendColorClass="text-amber-400"
                  iconContainerClass="bg-amber-500/10 border-amber-500/20 text-amber-400"
                />

                <MetricCard
                  title="Ticket Promedio"
                  value={`$${Math.round(averageTicket).toLocaleString()}`}
                  subtitle="Por orden de compra"
                  icon={<DollarSign className="w-7 h-7" />}
                  trendIcon={<TrendingUp size={14} />}
                  trendColorClass="text-blue-400"
                  iconContainerClass="bg-blue-500/10 border-blue-500/20 text-blue-400"
                />

                <MetricCard
                  title="Utilidad Neta Real"
                  value={`$${totalNetProfit.toLocaleString()}`}
                  subtitle="Ganancia neta estimada"
                  icon={<DollarSign className="w-7 h-7" />}
                  trendIcon={<TrendingUp size={14} />}
                  trendColorClass="text-emerald-400"
                  valueColorClass="text-emerald-400"
                  iconContainerClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                />
              </div>

              {/* Sección Inferior */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TopProductsCard products={topProducts} />
                <RecentOrdersCard orders={filteredOrders} />
              </div>
            </>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
