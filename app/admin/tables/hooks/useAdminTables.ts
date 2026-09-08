"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import {
  Table,
  ActiveOrder,
  Product,
  OrderItem,
  ToastState,
  ConfirmDialogState,
  PaymentMethod,
} from "../types";

export function useAdminTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    // 1. Obtener el restaurante mediante restaurant_members (soporta dueños y empleados/cajeros)
    const { data: memberData, error: memberError } = await supabase
      .from("restaurant_members")
      .select("restaurant_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (memberError || !memberData) {
      setLoading(false);
      return;
    }

    const currentRestaurantId = memberData.restaurant_id;
    setRestaurantId(currentRestaurantId);

    // 2. Mesas
    const { data: tablesData } = await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", currentRestaurantId)
      .order("number", { ascending: true });
    if (tablesData) setTables(tablesData);

    // 3. Órdenes activas (excluyendo pagadas)
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, table_id, total_price, state, items, note, created_at")
      .eq("restaurant_id", currentRestaurantId)
      .in("state", ["pendiente", "preparado", "listo", "entregado"]);
    if (ordersData) setActiveOrders(ordersData as ActiveOrder[]);

    // 4. Productos del menú
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, price")
      .eq("restaurant_id", currentRestaurantId);
    if (productsData) setProducts(productsData);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- CRUD DE MESAS ---
  const createTable = useCallback(
    async (number: number) => {
      if (restaurantId === null) return false;
      const { data, error } = await supabase
        .from("tables")
        .insert([{ number, restaurant_id: restaurantId }])
        .select();

      if (error) {
        showToast("Error al crear mesa: " + error.message, "error");
        return false;
      }
      if (data) {
        setTables((prev) => [...prev, data[0]]);
        showToast("Mesa creada exitosamente", "success");
        return true;
      }
      return false;
    },
    [restaurantId, showToast],
  );

  const updateTable = useCallback(
    async (id: number, number: number) => {
      const { error } = await supabase
        .from("tables")
        .update({ number })
        .eq("id", id);

      if (error) {
        showToast("Error al actualizar mesa: " + error.message, "error");
        return false;
      }
      setTables((prev) =>
        prev.map((t) => (t.id === id ? { ...t, number } : t)),
      );
      showToast("Mesa actualizada correctamente", "success");
      return true;
    },
    [showToast],
  );

  const deleteTable = useCallback(
    (id: number) => {
      setConfirmDialog({
        isOpen: true,
        title: "Eliminar Mesa",
        description:
          "¿Estás seguro de eliminar esta mesa? Esta acción no se puede deshacer.",
        confirmText: "Sí, eliminar",
        type: "danger",
        onConfirm: async () => {
          setConfirmDialog(null);
          const { error } = await supabase.from("tables").delete().eq("id", id);
          if (error) {
            showToast("Error al eliminar la mesa", "error");
          } else {
            setTables((prev) => prev.filter((t) => t.id !== id));
            showToast("Mesa eliminada", "info");
          }
        },
      });
    },
    [showToast],
  );

  // --- RONDAS ---
  const sendNewRound = useCallback(
    async (
      tableId: number,
      tableNumber: number,
      cart: OrderItem[],
      note: string,
    ) => {
      if (restaurantId === null) return false;
      if (cart.length === 0) {
        showToast(
          "Selecciona al menos un producto nuevo para enviar.",
          "error",
        );
        return false;
      }

      setIsSaving(true);
      const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            restaurant_id: restaurantId,
            table_id: tableId,
            order_type: "mesa",
            state: "pendiente",
            items: cart,
            total_price: totalPrice,
            note,
            table_number: tableNumber,
          },
        ])
        .select();

      setIsSaving(false);

      if (error) {
        showToast("Error al enviar adición: " + error.message, "error");
        return false;
      }
      if (data) {
        setActiveOrders((prev) => [...prev, data[0] as ActiveOrder]);
        showToast("¡Nueva ronda enviada a cocina con éxito! 🚀", "success");
        return true;
      }
      return false;
    },
    [restaurantId, showToast],
  );

  // --- PAGOS ---
  const processPayment = useCallback(
    async (
      tableId: number,
      grandTotal: number,
      tipAmount: number,
      paymentMethod: PaymentMethod,
    ) => {
      const tableOrders = activeOrders.filter((o) => o.table_id === tableId);
      if (tableOrders.length === 0) return false;

      setIsSaving(true);
      const orderIds = tableOrders.map((o) => o.id);

      const { error: paymentError } = await supabase.from("payments").insert([
        {
          restaurant_id: restaurantId,
          table_id: tableId,
          amount: grandTotal,
          tip_amount: tipAmount,
          payment_method: paymentMethod,
        },
      ]);

      if (paymentError) {
        showToast("Error al guardar el pago: " + paymentError.message, "error");
        setIsSaving(false);
        return false;
      }

      const { error } = await supabase
        .from("orders")
        .update({ state: "pagado" })
        .in("id", orderIds);

      setIsSaving(false);

      if (!error) {
        setActiveOrders((prev) => prev.filter((o) => o.table_id !== tableId));
        showToast("¡Cuenta cobrada y mesa liberada con éxito! 🥂", "success");
        return true;
      }
      showToast("Error al cobrar cuenta: " + error.message, "error");
      return false;
    },
    [activeOrders, restaurantId, showToast],
  );

  return {
    tables,
    activeOrders,
    products,
    loading,
    isSaving,
    toast,
    showToast,
    confirmDialog,
    setConfirmDialog,
    createTable,
    updateTable,
    deleteTable,
    sendNewRound,
    processPayment,
  };
}
