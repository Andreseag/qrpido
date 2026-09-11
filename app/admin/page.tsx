"use client";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  ReceiptText,
  Store,
} from "lucide-react";
import DashboardFilterBar from "../components/AdminDashboard/DashboardFilterBar/DashboardFilterBar";
import DashboardHeader from "../components/AdminDashboard/DashboardHeader/DashboardHeader";
import MetricCard from "../components/AdminDashboard/MetricCard/MetricCard";
import TopProductsCard from "../components/AdminDashboard/TopProductsCard/TopProductsCard";
import RecentOrdersCard from "../components/AdminDashboard/RecentOrdersCard/RecentOrdersCard";
import { RoleGuard } from "../components/Auth/RoleGuard/RoleGuard";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import RestaurantSelector from "../components/Restaurantselector/Restaurantselector";

export default function AdminDashboardPage() {
  const {
    loading,
    restaurants,
    needsSelection,
    restaurantName,
    selectRestaurant,
    changeRestaurant,
    filter,
    setFilter,
    dateRange,
    setDateRange,
    filteredOrders,
    metrics,
    refresh,
  } = useAdminDashboard();

  const {
    totalRevenue,
    totalOrdersCount,
    averageTicket,
    totalNetProfit,
    topProducts,
  } = metrics;

  // Tiene más de un restaurante y todavía no ha elegido cuál ver
  if (needsSelection) {
    return (
      <RoleGuard allowedRoles={["owner"]}>
        <RestaurantSelector
          restaurants={restaurants}
          onSelect={selectRestaurant}
        />
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["owner"]}>
      <div className="min-h-screen bg-background text-foreground flex">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <DashboardHeader
            restaurantName={restaurantName}
            onRefresh={refresh}
          />

          {restaurants.length > 1 && (
            <button
              onClick={changeRestaurant}
              className="mb-8 -mt-3 flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
              <Store className="w-3.5 h-3.5" /> Cambiar restaurante
            </button>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-primary font-black tracking-widest uppercase text-xs">
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
                  trendColorClass="text-success"
                  iconContainerClass="bg-success/10 border-success/20 text-success"
                />

                <MetricCard
                  title="Total Pedidos"
                  value={totalOrdersCount}
                  subtitle="Órdenes en el período"
                  icon={<ReceiptText className="w-7 h-7" />}
                  trendIcon={<ShoppingBag size={14} />}
                  trendColorClass="text-primary"
                  iconContainerClass="bg-primary/10 border-primary/20 text-primary"
                />

                <MetricCard
                  title="Ticket Promedio"
                  value={`$${Math.round(averageTicket).toLocaleString()}`}
                  subtitle="Por orden de compra"
                  icon={<DollarSign className="w-7 h-7" />}
                  trendIcon={<TrendingUp size={14} />}
                  trendColorClass="text-info"
                  iconContainerClass="bg-info/10 border-info/20 text-info"
                />

                <MetricCard
                  title="Utilidad Neta Real"
                  value={`$${totalNetProfit.toLocaleString()}`}
                  subtitle="Ganancia neta estimada"
                  icon={<DollarSign className="w-7 h-7" />}
                  trendIcon={<TrendingUp size={14} />}
                  trendColorClass="text-success"
                  valueColorClass="text-success"
                  iconContainerClass="bg-success/10 border-success/20 text-success"
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
