export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  cost?: number;
}

export interface Order {
  id: number;
  created_at: string;
  total_price: number;
  state: string;
  items: OrderItem[];
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}
