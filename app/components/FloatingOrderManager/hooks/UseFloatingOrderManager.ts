"use client";

import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";
import { supabase } from "@/app/lib/supabase";
import { useEffect, useRef, useState } from "react";

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

const STORAGE_PREFIX = "floating_order_drafts_";

export function UseFloatingOrderManager({
  initialClientData,
}: FloatingOrderManagerProps) {
  const { selectedRestaurantId } = useSelectedRestaurant();

  const [drafts, setDrafts] = useState<OrderDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const loadedRestaurantRef = useRef<string | null>(null);
  const processedClientRef = useRef<string | null>(null);

  const showToast = (message: string, type: Toast["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 🛠️ Función auxiliar para guardar explícitamente en localStorage
  const saveToLocalStorage = (
    currentDrafts: OrderDraft[],
    currentActiveId: string | null,
  ) => {
    console.log("zasadasd");
    if (!selectedRestaurantId || typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `${STORAGE_PREFIX}${selectedRestaurantId}`,
        JSON.stringify(currentDrafts),
      );
      if (currentActiveId) {
        localStorage.setItem(
          `${STORAGE_PREFIX}active_${selectedRestaurantId}`,
          currentActiveId,
        );
      } else {
        localStorage.removeItem(
          `${STORAGE_PREFIX}active_${selectedRestaurantId}`,
        );
      }
    } catch (e) {
      console.error("Error saving to localStorage", e);
    }
  };

  // 1. Cargar borradores al cambiar o tener disponible el restaurante
  useEffect(() => {
    if (!selectedRestaurantId) return;
    if (loadedRestaurantRef.current === selectedRestaurantId) return;
    loadedRestaurantRef.current = selectedRestaurantId;

    try {
      const savedDrafts = localStorage.getItem(
        `${STORAGE_PREFIX}${selectedRestaurantId}`,
      );
      const savedActive = localStorage.getItem(
        `${STORAGE_PREFIX}active_${selectedRestaurantId}`,
      );

      if (savedDrafts) {
        const parsed = JSON.parse(savedDrafts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDrafts(parsed);
          if (savedActive && parsed.some((d) => d.draftId === savedActive)) {
            setActiveDraftId(savedActive);
          } else {
            setActiveDraftId(parsed[0].draftId);
          }
        }
      }
    } catch (e) {
      console.error("Error loading drafts", e);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchProducts();
      fetchTables();
    }
  }, [selectedRestaurantId]);

  // Manejar cliente inicial de WhatsApp
  useEffect(() => {
    if (!initialClientData || !initialClientData.name || !selectedRestaurantId)
      return;

    const clientKey = `${initialClientData.phone}_${initialClientData.name}`;
    if (processedClientRef.current === clientKey) return;
    processedClientRef.current = clientKey;

    setDrafts((prev) => {
      const existing = prev.find(
        (d) =>
          d.customerPhone === initialClientData.phone &&
          initialClientData.phone !== "",
      );
      if (existing) {
        setActiveDraftId(existing.draftId);
        saveToLocalStorage(prev, existing.draftId);
        return prev;
      }

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

      const nextDrafts = [...prev, newDraft];
      setActiveDraftId(newDraft.draftId);
      saveToLocalStorage(nextDrafts, newDraft.draftId);
      return nextDrafts;
    });

    setIsMinimized(false);
  }, [initialClientData, selectedRestaurantId]);

  // Asegurar que activeDraftId sea válido si la lista cambia
  useEffect(() => {
    if (
      drafts.length > 0 &&
      (!activeDraftId || !drafts.some((d) => d.draftId === activeDraftId))
    ) {
      const newActive = drafts[0].draftId;
      setActiveDraftId(newActive);
      saveToLocalStorage(drafts, newActive);
    } else if (drafts.length === 0) {
      setActiveDraftId(null);
      saveToLocalStorage([], null);
    }
  }, [drafts, activeDraftId]);

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

    setDrafts((prev) => {
      const next = prev.map((d) =>
        d.draftId === draftId
          ? {
              ...d,
              customerId: data ? data.id : null,
              customerName: data ? data.name : d.customerName,
              customerPersistentNotes: data
                ? data.notes || ""
                : d.customerPersistentNotes,
            }
          : d,
      );
      saveToLocalStorage(next, activeDraftId);
      return next;
    });
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
    setDrafts((prev) => {
      const next = [...prev, newDraft];
      setActiveDraftId(newDraft.draftId);
      saveToLocalStorage(next, newDraft.draftId);
      return next;
    });
    setIsMinimized(false);
  };

  const closeDraft = (draftId: string) => {
    if (!draftId) return;

    setDrafts((prev) => {
      // 1. Filtrar usando el estado más reciente (prev)
      const nextDrafts = prev.filter((d) => d.draftId !== draftId);

      // 2. Calcular el nuevo ID activo de forma segura
      let nextActiveId = activeDraftId;
      if (activeDraftId === draftId) {
        nextActiveId =
          nextDrafts.length > 0
            ? nextDrafts[nextDrafts.length - 1].draftId
            : null;
      }

      // 3. Actualizar el estado activo
      setActiveDraftId(nextActiveId);

      // 4. Guardar explícitamente en localStorage con los datos frescos
      saveToLocalStorage(nextDrafts, nextActiveId);

      return nextDrafts;
    });
  };

  const updateDraft = (draftId: string, updates: Partial<OrderDraft>) => {
    setDrafts((prev) => {
      const next = prev.map((d) =>
        d.draftId === draftId ? { ...d, ...updates } : d,
      );
      saveToLocalStorage(next, activeDraftId);
      return next;
    });
  };

  const addItemToDraft = (draftId: string, product: Product) => {
    setDrafts((prev) => {
      const next = prev.map((d) => {
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
      });
      saveToLocalStorage(next, activeDraftId);
      return next;
    });
  };

  const removeItemFromDraft = (draftId: string, productId: string) => {
    setDrafts((prev) => {
      const next = prev.map((d) => {
        if (d.draftId !== draftId) return d;
        return {
          ...d,
          selectedItems: d.selectedItems.filter(
            (i) => i.productId !== productId,
          ),
        };
      });
      saveToLocalStorage(next, activeDraftId);
      return next;
    });
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
      closeDraft(draft.draftId); // Esto ahora limpia y actualiza el localStorage automáticamente
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
    setActiveDraftId: (id: string | null) => {
      setActiveDraftId(id);
      saveToLocalStorage(drafts, id);
    },
    activeDraftId,
    closeDraft,
    checkCustomerOnServer,
    isMinimized,
    setIsMinimized,
  };
}
