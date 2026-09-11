export interface OrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderState =
  | "pendiente"
  | "en_cocina"
  | "preparando"
  | "listo"
  | "en_camino"
  | "entregado"
  | "cancelado";

export interface Order {
  id: number;
  created_at: string;
  items: OrderItem[];
  state: OrderState;
  order_type?: "mesa" | "llevar" | "domicilio" | "preparando" | string;
  table_number?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  address?: string | null;
  payment_method?: string | null;
  cash_given?: number | null;
  restaurant_id: number;
  total_price: number;
  note?: string | null;
}

export interface KanbanColumnDef {
  id: OrderState;
  title: string;
  headerBg: string;
}

export const COLUMNS: KanbanColumnDef[] = [
  {
    id: "en_cocina",
    title: "En Cocina",
    headerBg: "bg-sky-500/10 border-sky-500/30 text-sky-400",
  },
  {
    id: "preparando",
    title: "En Cocina",
    headerBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  },
  {
    id: "listo",
    title: "Listos / Despacho",
    headerBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  },
  {
    id: "en_camino",
    title: "En Camino",
    headerBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  },
  {
    id: "entregado",
    title: "Entregados",
    headerBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
];
