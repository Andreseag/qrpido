export const EXPENSE_CATEGORIES = [
  "arriendo",
  "materia_prima",
  "publicidad",
  "servicios_publicos",
  "nomina",
  "mantenimiento",
  "seguros",
  "otros",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  arriendo: "Arriendo",
  materia_prima: "Materia Prima / Insumos",
  publicidad: "Publicidad",
  servicios_publicos: "Servicios Públicos",
  nomina: "Nómina / Salarios",
  mantenimiento: "Mantenimiento y Reparaciones",
  seguros: "Seguros",
  otros: "Otros / Varios",
};

export interface Expense {
  id: string;
  restaurant_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string; // formato YYYY-MM-DD
  is_recurring: boolean;
  receipt_path: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface ExpenseFormValues {
  category: ExpenseCategory;
  description: string;
  amount: string;
  expense_date: string;
  is_recurring: boolean;
}
