interface CustomerStats {
  id: string;
  name: string;
  phone: string;
  lastOrderDate: string | null;
  daysSinceLastOrder: number;
  totalOrders: number;
  favoriteDish: string;
}
