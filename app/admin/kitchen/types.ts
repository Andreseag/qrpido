interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  created_at: string;
  items: OrderItem[];
  state: "pendiente" | "preparando" | "listo" | "entregado";
  order_type?: "mesa" | "llevar" | "domicilio" | string;
  table_id?: number | null;
  table_number?: string | null;
  address?: string | null;
  payment_method?: string | null;
  cash_given?: number | null;
  restaurant_id: number;
  total_price: number;
  note?: string | null;
}
