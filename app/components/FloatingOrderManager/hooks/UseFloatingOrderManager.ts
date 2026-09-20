"use client";

import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";
import { supabase } from "@/app/lib/supabase";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
}

interface Table {
  id: string;
  number: number | string;
}

interface OrderDraft {
  draftId: string;
  customerName: string;
  customerPhone: string;
  customerId: string | null;
  customerPersistentNotes: string;
  orderType: "mesa" | "domicilio";
  tableNumber: string;
  address: string;
  paymentMethod: string;
  cashGiven: string;
  selectedItems: {
    productId: string;
    name: string;
    price: number;
    cost: number;
    quantity: number;
  }[];
  note: string;
  tempProduct: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

interface FloatingOrderManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialClientData?: { name: string; phone: string } | null;
}

export function UseFloatingOrderManager({
  initialClientData,
}: FloatingOrderManagerProps) {
  const { selectedRestaurantId } = useSelectedRestaurant();

  const [drafts, setDrafts] = useState<OrderDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // use
  const showToast = (message: string, type: Toast["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchProducts();
      fetchTables();
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    if (initialClientData && initialClientData.name) {
      const newDraft: OrderDraft = {
        draftId: Date.now().toString(),
        customerName: initialClientData.name,
        customerPhone: initialClientData.phone || "",
        customerId: null,
        customerPersistentNotes: "",
        orderType: "domicilio",
        tableNumber: "",
        address: "",
        paymentMethod: "efectivo",
        cashGiven: "",
        selectedItems: [],
        note: "Pedido originado desde WhatsApp",
        tempProduct: "",
      };
      setDrafts((prev) => [...prev, newDraft]);
      setActiveDraftId(newDraft.draftId);

      if (initialClientData.phone && selectedRestaurantId) {
        checkCustomerOnServer(newDraft.draftId, initialClientData.phone);
      }
    }
  }, [initialClientData, selectedRestaurantId]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, price, cost")
      .eq("restaurant_id", selectedRestaurantId)
      .eq("stock", true);
    if (data) setProducts(data);
    setLoadingProducts(false);
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    const { data } = await supabase
      .from("tables")
      .select("id, number")
      .eq("restaurant_id", selectedRestaurantId)
      .order("number", { ascending: true });
    if (data) setTables(data);
    setLoadingTables(false);
  };

  const checkCustomerOnServer = async (draftId: string, phone: string) => {
    if (!phone || phone.length < 7 || !selectedRestaurantId) return;

    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("restaurant_id", selectedRestaurantId)
      .eq("phone", phone)
      .single();

    if (data) {
      setDrafts((prev) =>
        prev.map((d) =>
          d.draftId === draftId
            ? {
                ...d,
                customerId: data.id,
                customerName: data.name,
                customerPersistentNotes: data.notes || "",
              }
            : d,
        ),
      );
    } else {
      setDrafts((prev) =>
        prev.map((d) =>
          d.draftId === draftId ? { ...d, customerId: null } : d,
        ),
      );
    }
  };

  const openNewDraft = () => {
    const newDraft: OrderDraft = {
      draftId: Date.now().toString(),
      customerName: "",
      customerPhone: "",
      customerId: null,
      customerPersistentNotes: "",
      orderType: "mesa",
      tableNumber: "",
      address: "",
      paymentMethod: "efectivo",
      cashGiven: "",
      selectedItems: [],
      note: "",
      tempProduct: "",
    };
    setDrafts((prev) => [...prev, newDraft]);
    setActiveDraftId(newDraft.draftId);
  };

  // Al cerrar una pestaña: si era la activa, salta a la última que quede
  // (o cierra el panel entero si no queda ninguna).
  const closeDraft = (draftId: string) => {
    setDrafts((prev) => {
      const next = prev.filter((d) => d.draftId !== draftId);
      if (activeDraftId === draftId) {
        setActiveDraftId(
          next.length > 0 ? next[next.length - 1].draftId : null,
        );
      }
      return next;
    });
  };

  const updateDraft = (draftId: string, updates: Partial<OrderDraft>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.draftId === draftId ? { ...d, ...updates } : d)),
    );
  };

  const addItemToDraft = (draftId: string, product: Product) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.draftId !== draftId) return d;
        const existing = d.selectedItems.find(
          (i) => i.productId === product.id,
        );
        if (existing) {
          return {
            ...d,
            tempProduct: "",
            selectedItems: d.selectedItems.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
          };
        }
        return {
          ...d,
          tempProduct: "",
          selectedItems: [
            ...d.selectedItems,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              cost: product.cost || 0,
              quantity: 1,
            },
          ],
        };
      }),
    );
  };

  const removeItemFromDraft = (draftId: string, productId: string) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.draftId !== draftId) return d;
        return {
          ...d,
          selectedItems: d.selectedItems.filter(
            (i) => i.productId !== productId,
          ),
        };
      }),
    );
  };

  const submitOrder = async (draft: OrderDraft) => {
    if (!selectedRestaurantId) {
      showToast("No hay restaurante asignado.", "error");
      return;
    }
    if (draft.selectedItems.length === 0) {
      showToast("Agrega al menos un producto al pedido.", "error");
      return;
    }

    if (draft.orderType === "mesa" && !draft.tableNumber) {
      showToast("Por favor selecciona un número de mesa.", "error");
      return;
    }

    if (draft.orderType === "domicilio") {
      if (!draft.address) {
        showToast("Por favor ingresa la dirección de envío.", "error");
        return;
      }
      if (draft.paymentMethod === "efectivo" && !draft.cashGiven) {
        showToast(
          "Por favor especifica con qué billete va a pagar en efectivo.",
          "error",
        );
        return;
      }
    }

    let customerId = draft.customerId;

    if (draft.customerPhone && draft.customerName) {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .upsert(
          {
            restaurant_id: selectedRestaurantId,
            phone: draft.customerPhone,
            name: draft.customerName,
            notes: draft.customerPersistentNotes || draft.note,
          },
          { onConflict: "restaurant_id, phone" },
        )
        .select("id")
        .single();

      if (!customerError && customerData) {
        customerId = customerData.id;
      }
    }

    const totalPrice = draft.selectedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const orderPayload = {
      restaurant_id: selectedRestaurantId,
      customer_id: customerId,
      customer_name: draft.customerName || "Cliente Mostrador",
      customer_phone: draft.customerPhone || "",
      order_type: draft.orderType,
      table_number: draft.orderType === "mesa" ? draft.tableNumber : null,
      address: draft.orderType === "domicilio" ? draft.address : null,
      payment_method:
        draft.orderType === "domicilio" ? draft.paymentMethod : "local",
      cash_given:
        draft.orderType === "domicilio" && draft.paymentMethod === "efectivo"
          ? parseFloat(draft.cashGiven)
          : null,
      items: draft.selectedItems,
      total_price: totalPrice,
      state: "en_cocina",
      note: draft.note,
    };

    const { error } = await supabase.from("orders").insert([orderPayload]);

    if (error) {
      showToast("Error al crear el pedido: " + error.message, "error");
    } else {
      showToast("¡Pedido creado y cliente registrado/actualizado con éxito!");
      closeDraft(draft.draftId);
    }
  };

  const activeDraft = drafts.find((d) => d.draftId === activeDraftId) || null;

  return {
    toast,
    activeDraft,
    updateDraft,
    submitOrder,
    removeItemFromDraft,
    addItemToDraft,
    openNewDraft,
    products,
    tables,
    loadingProducts,
    loadingTables,
    drafts,
    setActiveDraftId,
    activeDraftId,
    closeDraft,
    checkCustomerOnServer,
  };
}
