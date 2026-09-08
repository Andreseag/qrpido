"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  X,
  ShoppingCart,
  Trash2,
  Send,
  MapPin,
  Utensils,
  CheckCircle2,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

interface FloatingOrderManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialClientData?: { name: string; phone: string } | null;
  restaurantId: string | null;
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

export default function FloatingOrderManager({
  restaurantId,
  initialClientData,
}: FloatingOrderManagerProps) {
  const [drafts, setDrafts] = useState<OrderDraft[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      fetchProducts();
      fetchTables();
    }
  }, [restaurantId]);

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
      setDrafts((prev) => [...prev.slice(-2), newDraft]);

      if (initialClientData.phone && restaurantId) {
        checkCustomerOnServer(newDraft.draftId, initialClientData.phone);
      }
    }
  }, [initialClientData, restaurantId]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, price, cost")
      .eq("restaurant_id", restaurantId)
      .eq("stock", true);
    if (data) setProducts(data);
    setLoadingProducts(false);
  };

  const fetchTables = async () => {
    setLoadingTables(true);
    const { data } = await supabase
      .from("tables")
      .select("id, number")
      .eq("restaurant_id", restaurantId)
      .order("number", { ascending: true });
    if (data) setTables(data);
    setLoadingTables(false);
  };

  const checkCustomerOnServer = async (draftId: string, phone: string) => {
    if (!phone || phone.length < 7 || !restaurantId) return;

    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("restaurant_id", restaurantId)
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
    setDrafts((prev) => [...prev.slice(-2), newDraft]);
  };

  const closeDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.draftId !== draftId));
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
    if (!restaurantId) return alert("No hay restaurante asignado.");
    if (draft.selectedItems.length === 0)
      return alert("Agrega al menos un producto al pedido.");

    if (draft.orderType === "mesa" && !draft.tableNumber) {
      return alert("Por favor selecciona un número de mesa.");
    }

    if (draft.orderType === "domicilio") {
      if (!draft.address)
        return alert("Por favor ingresa la dirección de envío.");
      if (draft.paymentMethod === "efectivo" && !draft.cashGiven) {
        return alert(
          "Por favor especifica con qué billete va a pagar en efectivo.",
        );
      }
    }

    let customerId = draft.customerId;

    if (draft.customerPhone && draft.customerName) {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .upsert(
          {
            restaurant_id: restaurantId,
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
      restaurant_id: restaurantId,
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
      alert("Error al crear el pedido: " + error.message);
    } else {
      alert("¡Pedido creado y cliente registrado/actualizado con éxito!");
      closeDraft(draft.draftId);
    }
  };

  return (
    <>
      <button
        onClick={openNewDraft}
        className="fixed bottom-6 right-6 z-40 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-amber-400/40">
        <Plus className="w-6 h-6 stroke-[3]" />
        <span className="text-xs uppercase tracking-wider">Nuevo Pedido</span>
      </button>

      <div className="fixed bottom-0 right-32 z-50 flex items-end gap-4 pointer-events-none px-4">
        {drafts.map((draft, index) => {
          const totalDraftPrice = draft.selectedItems.reduce(
            (acc, i) => acc + i.price * i.quantity,
            0,
          );

          return (
            <div
              key={draft.draftId}
              className="pointer-events-auto w-80 md:w-96 bg-slate-900 border border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col max-h-[650px] animate-in slide-in-from-bottom duration-200">
              <div className="bg-slate-950 px-4 py-3 rounded-t-3xl border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Pedido en Paralelo #{index + 1}
                  </span>
                </div>
                <button
                  onClick={() => closeDraft(draft.draftId)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
                <div>
                  <label className="font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Tipo de Pedido
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft(draft.draftId, { orderType: "mesa" })
                      }
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        draft.orderType === "mesa"
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}>
                      <Utensils className="w-3.5 h-3.5" /> Mesa
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraft(draft.draftId, { orderType: "domicilio" })
                      }
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        draft.orderType === "domicilio"
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}>
                      <MapPin className="w-3.5 h-3.5" /> Domicilio
                    </button>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase text-[10px] text-slate-400 tracking-wider">
                      Datos del Cliente
                    </span>
                    {draft.customerId ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Frecuente
                      </span>
                    ) : (
                      draft.customerPhone.length >= 7 && (
                        <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <UserPlus className="w-3 h-3" /> Nuevo (Se registrará)
                        </span>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold uppercase text-[9px] text-slate-400 tracking-wider block mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 3001234567"
                        value={draft.customerPhone}
                        onChange={(e) =>
                          updateDraft(draft.draftId, {
                            customerPhone: e.target.value,
                          })
                        }
                        onBlur={(e) =>
                          checkCustomerOnServer(draft.draftId, e.target.value)
                        }
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold uppercase text-[9px] text-slate-400 tracking-wider block mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={draft.customerName}
                        onChange={(e) =>
                          updateDraft(draft.draftId, {
                            customerName: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  {draft.customerPersistentNotes && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-amber-400 block">
                          Observación guardada del cliente:
                        </span>
                        <p className="text-[11px] text-amber-200/90 font-medium">
                          {draft.customerPersistentNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {draft.orderType === "mesa" && (
                  <div>
                    <label className="font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Seleccionar Mesa
                    </label>
                    <select
                      value={draft.tableNumber}
                      onChange={(e) =>
                        updateDraft(draft.draftId, {
                          tableNumber: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium cursor-pointer">
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

                {draft.orderType === "domicilio" && (
                  <div className="space-y-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                    <div>
                      <label className="font-bold uppercase text-slate-400 tracking-wider block mb-1">
                        Dirección de Envío
                      </label>
                      <input
                        type="text"
                        placeholder="Calle 10 # 20-30, Barrio..."
                        value={draft.address}
                        onChange={(e) =>
                          updateDraft(draft.draftId, {
                            address: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold uppercase text-slate-400 tracking-wider block mb-1">
                          Medio de Pago
                        </label>
                        <select
                          value={draft.paymentMethod}
                          onChange={(e) =>
                            updateDraft(draft.draftId, {
                              paymentMethod: e.target.value,
                            })
                          }
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium cursor-pointer">
                          <option value="efectivo">Efectivo</option>
                          <option value="nequi">Nequi</option>
                          <option value="daviplata">Daviplata</option>
                          <option value="transferencia">Transferencia</option>
                          <option value="dataphone">Datáfono</option>
                        </select>
                      </div>

                      {draft.paymentMethod === "efectivo" && (
                        <div>
                          <label className="font-bold uppercase text-slate-400 tracking-wider block mb-1">
                            Paga con (Billete)
                          </label>
                          <input
                            type="number"
                            placeholder="Ej: 50000"
                            value={draft.cashGiven}
                            onChange={(e) =>
                              updateDraft(draft.draftId, {
                                cashGiven: e.target.value,
                              })
                            }
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Añadir Platos
                  </label>
                  <select
                    value={draft.tempProduct}
                    onChange={(e) => {
                      const productId = e.target.value;
                      if (!productId) return;
                      const prod = products.find(
                        (p) => String(p.id) === String(productId),
                      );
                      if (prod) {
                        addItemToDraft(draft.draftId, prod);
                      }
                    }}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium cursor-pointer">
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
                  {draft.selectedItems.length === 0 ? (
                    <p className="text-slate-500 text-center py-3 italic">
                      No hay productos añadidos aún.
                    </p>
                  ) : (
                    draft.selectedItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                        <div>
                          <p className="font-bold text-slate-200">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {item.quantity} x ${item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-amber-400">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() =>
                              removeItemFromDraft(draft.draftId, item.productId)
                            }
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <label className="font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Nota / Observaciones de esta orden
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Sin cebolla, término medio..."
                    value={draft.note}
                    onChange={(e) =>
                      updateDraft(draft.draftId, { note: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between rounded-b-3xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total
                  </span>
                  <span className="text-sm font-black text-amber-400">
                    ${totalDraftPrice.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => submitOrder(draft)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10">
                  <Send className="w-3.5 h-3.5" /> Enviar Pedido
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
