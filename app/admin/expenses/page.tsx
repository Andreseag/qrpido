"use client";
import { useState } from "react";
import { Wallet, Plus, RefreshCw, Copy } from "lucide-react";
import { Expense, EXPENSE_CATEGORY_LABELS, ExpenseFormValues } from "./types";
import { useExpenses } from "./hooks/Useexpenses";
import RestaurantSelector from "@/app/components/Restaurantselector/Restaurantselector";
import { MonthNavigator } from "./components/Monthnavigator/Monthnavigator";
import MetricCard from "@/app/components/AdminDashboard/MetricCard/MetricCard";
import { ExpensesTable } from "./components/Expensestable/Expensestable";
import { ExpenseFormDrawer } from "./components/Expenseformdrawer/Expenseformdrawer";

export default function AdminExpensesPage() {
  const {
    loading,
    restaurants,
    needsSelection,
    selectRestaurant,
    year,
    month,
    goToPreviousMonth,
    goToNextMonth,
    expenses,
    totalAmount,
    totalsByCategory,
    saving,
    duplicating,
    createExpense,
    updateExpense,
    deleteExpense,
    duplicatePreviousMonth,
    getReceiptUrl,
  } = useExpenses();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  if (needsSelection) {
    return (
      <RestaurantSelector
        restaurants={restaurants}
        onSelect={selectRestaurant}
      />
    );
  }

  const openCreateDrawer = () => {
    setEditingExpense(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (
    values: ExpenseFormValues,
    receiptFile: File | null,
  ) => {
    if (editingExpense) {
      return updateExpense(editingExpense.id, values, receiptFile);
    }
    return createExpense(values, receiptFile);
  };

  const topCategoryEntry = Object.entries(totalsByCategory).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return (
    <div className="p-6 md:p-10 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
            <Wallet className="text-primary w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Gastos e Insumos
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Arriendo, insumos, publicidad, servicios y demás gastos operativos
            </p>
          </div>
        </div>

        <MonthNavigator
          year={year}
          month={month}
          onPrevious={goToPreviousMonth}
          onNext={goToNextMonth}
        />
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Cargando gastos...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Total Gastos del Mes"
              value={`$${totalAmount.toLocaleString()}`}
              subtitle="Suma de todas las categorías"
              icon={<Wallet className="w-7 h-7" />}
              trendIcon={<Wallet className="w-7 h-7" />}
              iconContainerClass="bg-primary/10 border-primary/20 text-primary"
            />
            <MetricCard
              title="Categoría con Mayor Gasto"
              value={
                topCategoryEntry
                  ? EXPENSE_CATEGORY_LABELS[
                      topCategoryEntry[0] as keyof typeof EXPENSE_CATEGORY_LABELS
                    ]
                  : "—"
              }
              subtitle={
                topCategoryEntry
                  ? `$${topCategoryEntry[1].toLocaleString()}`
                  : "Sin datos este mes"
              }
              icon={<Wallet className="w-7 h-7" />}
              trendIcon={<Wallet className="w-7 h-7" />}
              iconContainerClass="bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 mb-6">
            <button
              onClick={duplicatePreviousMonth}
              disabled={duplicating}
              className="flex items-center gap-2 bg-surface hover:bg-surface/80 border border-border text-foreground font-bold px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50">
              <Copy className="w-4 h-4" />
              {duplicating
                ? "Duplicando..."
                : "Duplicar Recurrentes del Mes Pasado"}
            </button>
            <button
              onClick={openCreateDrawer}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-3.5 rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-primary/10">
              <Plus className="w-4 h-4" /> Nuevo Gasto
            </button>
          </div>

          <ExpensesTable
            expenses={expenses}
            onEdit={openEditDrawer}
            onDelete={deleteExpense}
            getReceiptUrl={getReceiptUrl}
          />
        </>
      )}

      <ExpenseFormDrawer
        isOpen={isDrawerOpen}
        editingExpense={editingExpense}
        saving={saving}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSubmit}
        getReceiptUrl={getReceiptUrl}
      />
    </div>
  );
}
