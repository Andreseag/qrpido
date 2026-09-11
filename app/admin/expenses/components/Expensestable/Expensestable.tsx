import { Paperclip, Pencil, Trash2, Repeat } from "lucide-react";
import { Expense, EXPENSE_CATEGORY_LABELS } from "../../types";

interface ExpensesTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  getReceiptUrl: (path: string) => string;
}

export function ExpensesTable({
  expenses,
  onEdit,
  onDelete,
  getReceiptUrl,
}: ExpensesTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-3xl p-16 text-center">
        <p className="text-xs text-muted-foreground">
          No hay gastos registrados en este período.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-black text-muted-foreground uppercase tracking-widest bg-background/60 border-b border-border">
            <th className="px-6 py-4">Descripción</th>
            <th className="px-6 py-4">Categoría</th>
            <th className="px-6 py-4 text-center">Fecha</th>
            <th className="px-6 py-4 text-center">Monto</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-surface/80 transition-all">
              <td className="px-6 py-5 font-bold text-foreground">
                <div className="flex items-center gap-2">
                  {expense.description}
                  {expense.is_recurring && (
                    <span title="Gasto recurrente">
                      <Repeat className="w-3.5 h-3.5 text-primary" />
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-5 text-muted-foreground text-xs">
                {EXPENSE_CATEGORY_LABELS[expense.category]}
              </td>
              <td className="px-6 py-5 text-center text-muted-foreground text-xs font-mono">
                {expense.expense_date}
              </td>
              <td className="px-6 py-5 text-center font-black text-foreground">
                ${expense.amount.toLocaleString()}
              </td>
              <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                {expense.receipt_path && (
                  <a
                    href={getReceiptUrl(expense.receipt_path)}
                    target="_blank"
                    rel="noreferrer"
                    title="Ver comprobante"
                    className="p-2 bg-background/80 hover:bg-surface border border-border text-foreground rounded-xl transition-colors cursor-pointer">
                    <Paperclip className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => onEdit(expense)}
                  className="p-2 bg-background/80 hover:bg-surface border border-border text-foreground rounded-xl transition-colors cursor-pointer"
                  title="Editar gasto">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 dark:text-rose-400 rounded-xl transition-colors cursor-pointer"
                  title="Eliminar gasto">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
