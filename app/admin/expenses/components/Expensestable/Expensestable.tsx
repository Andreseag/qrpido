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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">
        <p className="text-xs text-slate-500">
          No hay gastos registrados en este período.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-950/60 border-b border-slate-800">
            <th className="px-6 py-4">Descripción</th>
            <th className="px-6 py-4">Categoría</th>
            <th className="px-6 py-4 text-center">Fecha</th>
            <th className="px-6 py-4 text-center">Monto</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="hover:bg-slate-800/30 transition-all">
              <td className="px-6 py-5 font-bold text-slate-200">
                <div className="flex items-center gap-2">
                  {expense.description}
                  {expense.is_recurring && (
                    <span title="Gasto recurrente">
                      <Repeat className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-5 text-slate-400 text-xs">
                {EXPENSE_CATEGORY_LABELS[expense.category]}
              </td>
              <td className="px-6 py-5 text-center text-slate-400 text-xs font-mono">
                {expense.expense_date}
              </td>
              <td className="px-6 py-5 text-center font-black text-white">
                ${expense.amount.toLocaleString()}
              </td>
              <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                {expense.receipt_path && (
                  <a
                    href={getReceiptUrl(expense.receipt_path)}
                    target="_blank"
                    rel="noreferrer"
                    title="Ver comprobante"
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer">
                    <Paperclip className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => onEdit(expense)}
                  className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                  title="Editar gasto">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-xl transition-colors cursor-pointer"
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
