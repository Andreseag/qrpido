export interface Table {
  id: number;
  number: number;
  restaurant_id: number;
  created_at: string;
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ActiveOrder {
  id: string;
  table_id: number;
  total_price: number;
  state: string;
  items: OrderItem[];
  created_at: string;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  type: "success" | "danger" | "warning";
  onConfirm: () => void;
}

export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";
