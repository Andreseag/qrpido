import { DateRange } from "react-day-picker";
import { Order } from "../../types/dashboard";
import { FilterType } from "../../components/AdminDashboard/DashboardFilterBar/DashboardFilterBar";

export function filterOrdersByRange(
  orders: Order[],
  filter: FilterType,
  dateRange?: DateRange,
): Order[] {
  if (!orders.length) return [];
  const now = new Date();

  return orders.filter((order) => {
    const orderDate = new Date(order.created_at);

    if (filter === "day") {
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
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
}
