"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Trash2,
  Send,
  MapPin,
  Utensils,
  CheckCircle2,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";

interface FloatingOrderManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialClientData?: { name: string; phone: string } | null;
}

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

export default function FloatingOrderManager({
  initialClientData,
}: FloatingOrderManagerProps) {
  // Restaurante activo global — reacciona solo si el usuario lo cambia
  // desde el sidebar, sin depender de un prop que el padre podría no
  // mantener sincronizado.
  const { selectedRestaurantId } = useSelectedRestaurant();

  const [drafts, setDrafts] = useState<OrderDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

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
      state: "pendiente",
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

  return (
    <>
      {/* Toast — arriba a la derecha, lejos del panel y del botón flotante */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl bg-surface border border-border shadow-2xl text-foreground text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-300">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <button
        onClick={openNewDraft}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-primary/40">
        <Plus className="w-6 h-6 stroke-[3]" />
        <span className="text-xs uppercase tracking-wider">Nuevo Pedido</span>
      </button>

      {drafts.length > 0 && (
        <div className="fixed bottom-0 right-32 z-50 w-80 md:w-96 px-4">
          <div className="bg-surface border border-border rounded-t-3xl shadow-2xl flex flex-col max-h-[650px] animate-in slide-in-from-bottom duration-200">
            {/* Tira de pestañas — una por cada pedido en paralelo abierto */}
            <div className="flex items-end gap-1 px-2 pt-2 overflow-x-auto scrollbar-none bg-background rounded-t-3xl border-b border-border">
              {drafts.map((draft, index) => {
                const isActive = draft.draftId === activeDraftId;
                const hasItems = draft.selectedItems.length > 0;
                return (
                  <button
                    key={draft.draftId}
                    onClick={() => setActiveDraftId(draft.draftId)}
                    title={draft.customerName || `Pedido ${index + 1}`}
                    className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-[11px] font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? "bg-surface text-foreground border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-border/40"
                    }`}>
                    {draft.orderType === "mesa" ? (
                      <Utensils className="w-3 h-3 shrink-0" />
                    ) : (
                      <MapPin className="w-3 h-3 shrink-0" />
                    )}
                    <span className="max-w-[84px] truncate">
                      {draft.customerName || `Pedido ${index + 1}`}
                    </span>
                    {hasItems && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeDraft(draft.draftId);
                      }}
                      className="ml-0.5 p-0.5 rounded-md hover:bg-border/60 text-muted-foreground hover:text-foreground shrink-0">
                      <X className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Panel del pedido activo — solo se renderiza uno a la vez */}
            {activeDraft && (
              <>
                <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
                  <div>
                    <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                      Tipo de Pedido
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft(activeDraft.draftId, {
                            orderType: "mesa",
                          })
                        }
                        className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          activeDraft.orderType === "mesa"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-border/80"
                        }`}>
                        <Utensils className="w-3.5 h-3.5" /> Mesa
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft(activeDraft.draftId, {
                            orderType: "domicilio",
                          })
                        }
                        className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          activeDraft.orderType === "domicilio"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-border hover:border-border/80"
                        }`}>
                        <MapPin className="w-3.5 h-3.5" /> Domicilio
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 bg-background/40 p-2.5 rounded-2xl border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="font-black uppercase text-[10px] text-muted-foreground tracking-wider">
                        Datos del Cliente
                      </span>
                      {activeDraft.customerId ? (
                        <span className="text-[9px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Frecuente
                        </span>
                      ) : (
                        activeDraft.customerPhone.length >= 7 && (
                          <span className="text-[9px] bg-info/10 text-info border border-info/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <UserPlus className="w-3 h-3" /> Nuevo (Se
                            registrará)
                          </span>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold uppercase text-[9px] text-muted-foreground tracking-wider block mb-1">
                          Teléfono / WhatsApp
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 3001234567"
                          value={activeDraft.customerPhone}
                          onChange={(e) =>
                            updateDraft(activeDraft.draftId, {
                              customerPhone: e.target.value,
                            })
                          }
                          onBlur={(e) =>
                            checkCustomerOnServer(
                              activeDraft.draftId,
                              e.target.value,
                            )
                          }
                          className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium"
                        />
                      </div>
                      <div>
                        <label className="font-bold uppercase text-[9px] text-muted-foreground tracking-wider block mb-1">
                          Nombre
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          value={activeDraft.customerName}
                          onChange={(e) =>
                            updateDraft(activeDraft.draftId, {
                              customerName: e.target.value,
                            })
                          }
                          className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium"
                        />
                      </div>
                    </div>

                    {activeDraft.customerPersistentNotes && (
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-2 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[9px] font-black uppercase text-primary block">
                            Observación guardada del cliente:
                          </span>
                          <p className="text-[11px] text-foreground/90 font-medium">
                            {activeDraft.customerPersistentNotes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {activeDraft.orderType === "mesa" && (
                    <div>
                      <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                        Seleccionar Mesa
                      </label>
                      <select
                        value={activeDraft.tableNumber}
                        onChange={(e) =>
                          updateDraft(activeDraft.draftId, {
                            tableNumber: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium cursor-pointer">
                        <option value="" disabled>
                          {loadingTables
                            ? "Cargando mesas..."
                            : tables.length === 0
                              ? "No hay mesas registradas"
                              : "Seleccionar mesa..."}
                        </option>
                        {tables.map((t) => (
                          <option key={t.id} value={t.number}>
                            Mesa #{t.number}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeDraft.orderType === "domicilio" && (
                    <div className="space-y-3 bg-background/40 p-3 rounded-2xl border border-border/60">
                      <div>
                        <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                          Dirección de Envío
                        </label>
                        <input
                          type="text"
                          placeholder="Calle 10 # 20-30, Barrio..."
                          value={activeDraft.address}
                          onChange={(e) =>
                            updateDraft(activeDraft.draftId, {
                              address: e.target.value,
                            })
                          }
                          className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                            Medio de Pago
                          </label>
                          <select
                            value={activeDraft.paymentMethod}
                            onChange={(e) =>
                              updateDraft(activeDraft.draftId, {
                                paymentMethod: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium cursor-pointer">
                            <option value="efectivo">Efectivo</option>
                            <option value="nequi">Nequi</option>
                            <option value="daviplata">Daviplata</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="dataphone">Datáfono</option>
                          </select>
                        </div>

                        {activeDraft.paymentMethod === "efectivo" && (
                          <div>
                            <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                              Paga con (Billete)
                            </label>
                            <input
                              type="number"
                              placeholder="Ej: 50000"
                              value={activeDraft.cashGiven}
                              onChange={(e) =>
                                updateDraft(activeDraft.draftId, {
                                  cashGiven: e.target.value,
                                })
                              }
                              className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                      Añadir Platos
                    </label>
                    <select
                      value={activeDraft.tempProduct}
                      onChange={(e) => {
                        const productId = e.target.value;
                        if (!productId) return;
                        const prod = products.find(
                          (p) => String(p.id) === String(productId),
                        );
                        if (prod) {
                          addItemToDraft(activeDraft.draftId, prod);
                        }
                      }}
                      className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium cursor-pointer">
                      <option value="" disabled>
                        {loadingProducts
                          ? "Cargando platos..."
                          : products.length === 0
                            ? "No hay productos con stock"
                            : "Seleccionar plato..."}
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${p.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {activeDraft.selectedItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-3 italic">
                        No hay productos añadidos aún.
                      </p>
                    ) : (
                      activeDraft.selectedItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between bg-background/60 p-2 rounded-xl border border-border">
                          <div>
                            <p className="font-bold text-foreground">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {item.quantity} x ${item.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-primary">
                              ${(item.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() =>
                                removeItemFromDraft(
                                  activeDraft.draftId,
                                  item.productId,
                                )
                              }
                              className="text-muted-foreground hover:text-danger p-1 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div>
                    <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                      Nota / Observaciones de esta orden
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Sin cebolla, término medio..."
                      value={activeDraft.note}
                      onChange={(e) =>
                        updateDraft(activeDraft.draftId, {
                          note: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                <div className="bg-background p-4 border-t border-border flex items-center justify-between rounded-b-3xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Total
                    </span>
                    <span className="text-sm font-black text-primary">
                      $
                      {activeDraft.selectedItems
                        .reduce((acc, i) => acc + i.price * i.quantity, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => submitOrder(activeDraft)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/10">
                    <Send className="w-3.5 h-3.5" /> Enviar Pedido
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
