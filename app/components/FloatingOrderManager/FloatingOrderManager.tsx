"use client";
import { useState } from "react";
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
  Search,
  Minus,
} from "lucide-react";
import { UseFloatingOrderManager } from "./hooks/UseFloatingOrderManager";

interface FloatingOrderManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialClientData?: { name: string; phone: string } | null;
}

export default function FloatingOrderManager({
  initialClientData,
}: FloatingOrderManagerProps) {
  const {
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
    isMinimized,
    setIsMinimized,
  } = UseFloatingOrderManager({ initialClientData });

  // Estado local para el buscador de productos
  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <>
      {/* Toast — arriba a la derecha */}
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

      {/* Botón flotante para crear nuevo pedido (Solo si no hay borradores activos) */}
      {drafts.length === 0 && (
        <button
          onClick={openNewDraft}
          className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-primary/40">
          <Plus className="w-6 h-6 stroke-[3]" />
          <span className="text-xs uppercase tracking-wider">Nuevo Pedido</span>
        </button>
      )}

      {/* Si hay borradores, evaluamos si está minimizado o expandido */}
      {drafts.length > 0 && (
        <>
          {isMinimized ? (
            /* 🔽 Barra flotante cuando está minimizado */
            <div className="fixed bottom-6 right-6 z-50 bg-surface border border-border shadow-2xl rounded-2xl px-5 py-3.5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-black text-foreground">
                  Pedidos en proceso ({drafts.length})
                </span>
              </div>
              <button
                onClick={() => setIsMinimized(false)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md shadow-primary/20">
                Restaurar
              </button>
            </div>
          ) : (
            /* 🔼 Contenedor principal expandido */
            <div className="fixed inset-0 z-50 flex flex-col bg-surface md:inset-auto md:bottom-6 md:right-6 md:w-[750px] md:max-h-[90vh] md:rounded-3xl md:border md:border-border md:shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Tira de pestañas y controles superiores */}
              <div className="flex items-center justify-between bg-background border-b border-border px-3 pt-2">
                <div className="flex items-end gap-1 overflow-x-auto scrollbar-none pt-2 flex-1">
                  {drafts.map((draft, index) => {
                    const isActive = draft.draftId === activeDraftId;
                    const hasItems = draft.selectedItems.length > 0;
                    return (
                      <button
                        key={draft.draftId}
                        onClick={() => setActiveDraftId(draft.draftId)}
                        title={draft.customerName || `Pedido ${index + 1}`}
                        className={`group relative flex items-center gap-1.5 px-4 py-2.5 rounded-t-2xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                          isActive
                            ? "bg-surface text-foreground border-b-2 border-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-border/40"
                        }`}>
                        {draft.orderType === "mesa" ? (
                          <Utensils className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="max-w-[100px] truncate">
                          {draft.customerName || `Pedido ${index + 1}`}
                        </span>
                        {hasItems && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeDraft(draft.draftId);
                          }}
                          className="ml-1 p-1 rounded-md hover:bg-border/80 text-muted-foreground hover:text-foreground shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Controles superiores derechos (Nuevo + Minimizar) */}
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <button
                    onClick={openNewDraft}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nuevo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-border/60 rounded-xl transition-all cursor-pointer"
                    title="Minimizar ventana">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Panel del pedido activo */}
              {activeDraft && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 md:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                    {/* Layout de 2 columnas en Desktop para aprovechar el espacio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Columna Izquierda: Tipo, Cliente, Mesa/Domicilio y Pago */}
                      <div className="space-y-4">
                        <div>
                          <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
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
                              className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                                activeDraft.orderType === "mesa"
                                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                  : "bg-background text-muted-foreground border-border hover:border-border/80"
                              }`}>
                              <Utensils className="w-4 h-4" /> Mesa
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateDraft(activeDraft.draftId, {
                                  orderType: "domicilio",
                                })
                              }
                              className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                                activeDraft.orderType === "domicilio"
                                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                  : "bg-background text-muted-foreground border-border hover:border-border/80"
                              }`}>
                              <MapPin className="w-4 h-4" /> Domicilio
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 bg-background/60 p-3.5 rounded-2xl border border-border/60">
                          <div className="flex items-center justify-between">
                            <span className="font-black uppercase text-[10px] text-muted-foreground tracking-wider">
                              Datos del Cliente
                            </span>
                            {activeDraft.customerId ? (
                              <span className="text-[10px] bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Frecuente
                              </span>
                            ) : (
                              activeDraft.customerPhone.length >= 7 && (
                                <span className="text-[10px] bg-info/10 text-info border border-info/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <UserPlus className="w-3 h-3" /> Nuevo
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
                                className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium text-xs"
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
                                className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium text-xs"
                              />
                            </div>
                          </div>

                          {activeDraft.customerPersistentNotes && (
                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[9px] font-black uppercase text-primary block">
                                  Observación del cliente:
                                </span>
                                <p className="text-xs text-foreground/90 font-medium">
                                  {activeDraft.customerPersistentNotes}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {activeDraft.orderType === "mesa" && (
                          <div>
                            <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                              Seleccionar Mesa
                            </label>
                            <select
                              value={activeDraft.tableNumber}
                              onChange={(e) =>
                                updateDraft(activeDraft.draftId, {
                                  tableNumber: e.target.value,
                                })
                              }
                              className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium cursor-pointer text-xs">
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
                          <div className="space-y-3 bg-background/60 p-3.5 rounded-2xl border border-border/60">
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
                                className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium text-xs"
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
                                  className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium cursor-pointer text-xs">
                                  <option value="efectivo">Efectivo</option>
                                  <option value="nequi">Nequi</option>
                                  <option value="daviplata">Daviplata</option>
                                  <option value="transferencia">
                                    Transferencia
                                  </option>
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
                                    className="w-full p-2.5 bg-surface border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium text-xs"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Columna Derecha: Buscador de Productos + Platos Seleccionados + Notas */}
                      <div className="space-y-4 flex flex-col">
                        {/* Buscador y Listado de Productos */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="font-bold uppercase text-muted-foreground tracking-wider">
                              Catálogo de Platos
                            </label>
                            <span className="text-[10px] text-muted-foreground">
                              {filteredProducts.length} disponibles
                            </span>
                          </div>

                          <div className="relative mb-2">
                            <input
                              type="text"
                              placeholder="Buscar plato por nombre..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              className="w-full p-2.5 pl-8 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium text-xs"
                            />
                            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-3" />
                          </div>

                          <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 border border-border/60 rounded-xl p-2 bg-background/40">
                            {loadingProducts ? (
                              <p className="text-muted-foreground text-center py-3 italic text-xs">
                                Cargando platos...
                              </p>
                            ) : filteredProducts.length === 0 ? (
                              <p className="text-muted-foreground text-center py-3 italic text-xs">
                                No se encontraron platos.
                              </p>
                            ) : (
                              filteredProducts.map((p) => (
                                <div
                                  key={p.id}
                                  onClick={() =>
                                    addItemToDraft(activeDraft.draftId, p)
                                  }
                                  className="flex items-center justify-between p-2 rounded-xl bg-surface hover:bg-primary/10 border border-border/40 hover:border-primary/40 transition-all cursor-pointer group">
                                  <div>
                                    <p className="font-bold text-foreground text-xs group-hover:text-primary transition-colors">
                                      {p.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      ${p.price.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground text-primary p-1.5 rounded-lg transition-all">
                                    <Plus className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Platos Seleccionados */}
                        <div>
                          <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                            Platos Seleccionados (
                            {activeDraft.selectedItems.length})
                          </label>
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1 border border-border/60 rounded-xl p-2 bg-background/40">
                            {activeDraft.selectedItems.length === 0 ? (
                              <p className="text-muted-foreground text-center py-3 italic text-xs">
                                No hay productos añadidos aún.
                              </p>
                            ) : (
                              activeDraft.selectedItems.map((item) => (
                                <div
                                  key={item.productId}
                                  className="flex items-center justify-between bg-surface p-2 rounded-xl border border-border/60">
                                  <div>
                                    <p className="font-bold text-foreground text-xs">
                                      {item.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {item.quantity} x $
                                      {item.price.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-primary text-xs">
                                      $
                                      {(
                                        item.price * item.quantity
                                      ).toLocaleString()}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeItemFromDraft(
                                          activeDraft.draftId,
                                          item.productId,
                                        )
                                      }
                                      className="text-muted-foreground hover:text-danger p-1 cursor-pointer transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Notas de la orden */}
                        <div>
                          <label className="font-bold uppercase text-muted-foreground tracking-wider block mb-1.5">
                            Nota / Observaciones
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
                            className="w-full p-2.5 bg-background border border-border rounded-xl text-foreground outline-none focus:border-primary font-medium text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer con total y botón de envío */}
                  <div className="bg-background p-4 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Total
                      </span>
                      <span className="text-base font-black text-primary">
                        $
                        {activeDraft.selectedItems
                          .reduce((acc, i) => acc + i.price * i.quantity, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeDraft) {
                            closeDraft(activeDraft.draftId);
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs text-muted-foreground hover:text-foreground hover:bg-border/40 transition-all cursor-pointer">
                        Cerrar Pedido
                      </button>
                      <button
                        type="button"
                        onClick={() => submitOrder(activeDraft)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20">
                        <Send className="w-4 h-4" /> Enviar Pedido
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
