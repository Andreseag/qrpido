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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <DashboardHeader
            restaurantName={restaurantName}
            onRefresh={refresh}
          />

          {restaurants.length > 1 && (
            <button
              onClick={changeRestaurant}
              className="mb-8 -mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">
              <Store className="w-3.5 h-3.5" /> Cambiar restaurante
            </button>
          )}

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
