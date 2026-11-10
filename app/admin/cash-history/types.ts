export interface CashRegisterRecord {
  id: string;
  opened_at: string;
  closed_at: string | null;
  initial_amount: number;
  expected_amount: number;
  real_amount: number | null;
  difference: number | null;
  suggested_base: number;
  notes: string | null;
  status: "open" | "closed";
  cash_sales?: number;
}
