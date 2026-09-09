import { Order, TopProduct } from "../../types/dashboard";

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrdersCount: number;
  averageTicket: number;
  totalNetProfit: number;
  topProducts: TopProduct[];
}

export function calculateDashboardMetrics(orders: Order[]): DashboardMetrics {
  let revenue = 0;
  let netProfit = 0;
  const count = orders.length;
  const productMap: {
    [key: string]: { quantity: number; revenue: number };
  } = {};

  orders.forEach((order) => {
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

  const topProducts: TopProduct[] = Object.keys(productMap)
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
    topProducts,
  };
}
