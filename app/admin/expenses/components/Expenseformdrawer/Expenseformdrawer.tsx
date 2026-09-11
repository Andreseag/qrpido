"use client";
import { useState, useEffect } from "react";
import { X, Paperclip } from "lucide-react";
import {
  Expense,
  ExpenseFormValues,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
} from "../../types";

interface ExpenseFormDrawerProps {
  isOpen: boolean;
  editingExpense: Expense | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (
    values: ExpenseFormValues,
    receiptFile: File | null,
  ) => Promise<boolean> | boolean;
  getReceiptUrl: (path: string) => string;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm: ExpenseFormValues = {
  category: "materia_prima",
  description: "",
  amount: "",
  expense_date: todayISO(),
  is_recurring: false,
};

export function ExpenseFormDrawer({
  isOpen,
  editingExpense,
  saving,
  onClose,
  onSubmit,
  getReceiptUrl,
}: ExpenseFormDrawerProps) {
  const [formData, setFormData] = useState<ExpenseFormValues>(emptyForm);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editingExpense) {
      setFormData({
        category: editingExpense.category,
        description: editingExpense.description,
        amount: editingExpense.amount.toString(),
        expense_date: editingExpense.expense_date,
        is_recurring: editingExpense.is_recurring,
      });
    } else {
      setFormData(emptyForm);
    }
    setReceiptFile(null);
  }, [isOpen, editingExpense]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData, receiptFile);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-surface border-l border-border h-full p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <h2 className="text-xl font-black text-foreground">
              {editingExpense ? "Editar" : "Nuevo"}{" "}
              <span className="text-primary">Gasto</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
              Categoría
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as ExpenseFormValues["category"],
                })
              }
              className="w-full p-4 bg-background border border-border rounded-2xl text-foreground text-sm cursor-pointer">
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {EXPENSE_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
              Descripción
            </label>
            <input
              required
              type="text"
              placeholder="Ej: Pago arriendo local - Marzo"
              className="w-full p-4 bg-background border border-border rounded-2xl text-foreground text-sm"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
                Monto (COP)
              </label>
              <input
                required
                type="number"
                className="w-full p-4 bg-background border border-border rounded-2xl text-foreground text-sm"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
                Fecha
              </label>
              <input
                required
                type="date"
                className="w-full p-4 bg-background border border-border rounded-2xl text-foreground text-sm"
                value={formData.expense_date}
                onChange={(e) =>
                  setFormData({ ...formData, expense_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is-recurring"
              checked={formData.is_recurring}
              onChange={(e) =>
                setFormData({ ...formData, is_recurring: e.target.checked })
              }
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
            <label
              htmlFor="is-recurring"
              className="text-xs font-bold uppercase text-foreground cursor-pointer">
              Es un gasto recurrente (arriendo, servicios, etc.)
            </label>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
              Comprobante (foto o PDF)
            </label>
            <label className="w-full flex items-center gap-2 p-4 bg-background border border-dashed border-border rounded-2xl text-muted-foreground text-xs cursor-pointer hover:border-primary transition-colors">
              <Paperclip className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {receiptFile
                  ? receiptFile.name
                  : editingExpense?.receipt_path
                    ? "Reemplazar comprobante actual"
                    : "Subir archivo (imagen o PDF)"}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
            </label>
            {editingExpense?.receipt_path && !receiptFile && (
              <a
                href={getReceiptUrl(editingExpense.receipt_path)}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-primary hover:underline mt-1.5 inline-block">
                Ver comprobante actual
              </a>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-4 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all">
            {saving
              ? "Guardando..."
              : editingExpense
                ? "Actualizar Gasto"
                : "Guardar Gasto"}
          </button>
        </form>
      </div>
    </div>
  );
}
