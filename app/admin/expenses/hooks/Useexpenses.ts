"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/app/lib/supabase";
import { Expense, ExpenseFormValues } from "../types";
import { useActiveRestaurant } from "@/app/hooks/Useactiverestaurant";

const RECEIPTS_BUCKET = "expense-receipts";

function getMonthRange(year: number, month: number) {
  // month es 0-indexado (convención de Date de JS)
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    startISO: start.toISOString().slice(0, 10),
    endISO: end.toISOString().slice(0, 10),
  };
}

export function useExpenses() {
  const {
    restaurants,
    loadingRestaurants,
    activeRestaurant,
    needsSelection,
    selectRestaurant,
  } = useActiveRestaurant();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexado

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const fetchExpenses = useCallback(
    async (restaurantId: string, y: number, m: number) => {
      setLoadingExpenses(true);
      const { startISO, endISO } = getMonthRange(y, m);

      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .gte("expense_date", startISO)
        .lte("expense_date", endISO)
        .order("expense_date", { ascending: false });

      if (!error && data) {
        setExpenses(data as Expense[]);
      }
      setLoadingExpenses(false);
    },
    [],
  );

  useEffect(() => {
    if (activeRestaurant) {
      fetchExpenses(activeRestaurant.id, year, month);
    } else {
      setExpenses([]);
      setLoadingExpenses(false);
    }
  }, [activeRestaurant, year, month, fetchExpenses]);

  const goToPreviousMonth = useCallback(() => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  // Sube el comprobante y devuelve su path dentro del bucket
  const uploadReceipt = useCallback(
    async (restaurantId: string, file: File) => {
      const filePath = `${restaurantId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .upload(filePath, file);

      if (error) {
        throw new Error("No se pudo subir el comprobante: " + error.message);
      }
      return filePath;
    },
    [],
  );

  const getReceiptUrl = useCallback((path: string) => {
    const { data } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  const createExpense = useCallback(
    async (values: ExpenseFormValues, receiptFile: File | null) => {
      if (!activeRestaurant) return false;
      setSaving(true);
      try {
        let receiptPath: string | null = null;
        if (receiptFile) {
          receiptPath = await uploadReceipt(activeRestaurant.id, receiptFile);
        }

        const { data, error } = await supabase
          .from("expenses")
          .insert([
            {
              restaurant_id: activeRestaurant.id,
              category: values.category,
              description: values.description,
              amount: parseFloat(values.amount) || 0,
              expense_date: values.expense_date,
              is_recurring: values.is_recurring,
              receipt_path: receiptPath,
            },
          ])
          .select();

        if (error) throw new Error(error.message);
        if (data) {
          setExpenses((prev) => [data[0] as Expense, ...prev]);
        }
        return true;
      } catch (err) {
        console.error("Error al crear gasto:", err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [activeRestaurant, uploadReceipt],
  );

  const updateExpense = useCallback(
    async (id: string, values: ExpenseFormValues, receiptFile: File | null) => {
      if (!activeRestaurant) return false;
      setSaving(true);
      try {
        let receiptPath: string | undefined;
        if (receiptFile) {
          receiptPath = await uploadReceipt(activeRestaurant.id, receiptFile);
        }

        const { data, error } = await supabase
          .from("expenses")
          .update({
            category: values.category,
            description: values.description,
            amount: parseFloat(values.amount) || 0,
            expense_date: values.expense_date,
            is_recurring: values.is_recurring,
            ...(receiptPath ? { receipt_path: receiptPath } : {}),
          })
          .eq("id", id)
          .select();

        if (error) throw new Error(error.message);
        if (data && data.length > 0) {
          setExpenses((prev) =>
            prev.map((e) => (e.id === id ? (data[0] as Expense) : e)),
          );
        }
        return true;
      } catch (err) {
        console.error("Error al actualizar gasto:", err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [activeRestaurant, uploadReceipt],
  );

  const deleteExpense = useCallback(async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
    return !error;
  }, []);

  // Duplica hacia el mes actual los gastos marcados como recurrentes del mes anterior
  const duplicatePreviousMonth = useCallback(async () => {
    if (!activeRestaurant) return { count: 0 };
    setDuplicating(true);
    try {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const { startISO, endISO } = getMonthRange(prevYear, prevMonth);

      const { data: prevExpenses, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("restaurant_id", activeRestaurant.id)
        .eq("is_recurring", true)
        .gte("expense_date", startISO)
        .lte("expense_date", endISO);

      if (error || !prevExpenses || prevExpenses.length === 0) {
        return { count: 0 };
      }

      const payload = prevExpenses.map((e: any) => {
        const originalDay = new Date(e.expense_date).getDate();
        const newDate = new Date(year, month, originalDay);
        return {
          restaurant_id: activeRestaurant.id,
          category: e.category,
          description: e.description,
          amount: e.amount,
          expense_date: newDate.toISOString().slice(0, 10),
          is_recurring: true,
          // El comprobante no se copia: cada mes trae su propia factura
          receipt_path: null,
        };
      });

      const { data: inserted, error: insertError } = await supabase
        .from("expenses")
        .insert(payload)
        .select();

      if (insertError) throw new Error(insertError.message);

      if (inserted) {
        await fetchExpenses(activeRestaurant.id, year, month);
      }

      return { count: inserted?.length || 0 };
    } finally {
      setDuplicating(false);
    }
  }, [activeRestaurant, month, year, fetchExpenses]);

  const totalAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses],
  );

  const totalsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + (e.amount || 0);
    });
    return map;
  }, [expenses]);

  const loading = loadingRestaurants || loadingExpenses;

  return {
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
  };
}
