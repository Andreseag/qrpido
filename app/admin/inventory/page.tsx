"use client";
import {
  Package,
  Plus,
  X,
  Pencil,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useInventory } from "./hooks/useInventory";

export default function AdminInventoryPage() {
  const {
    products,
    loading,
    isDrawerOpen,
    setIsDrawerOpen,
    editingProduct,
    toast,
    formData,
    setFormData,
    toggleStock,
    openCreateDrawer,
    openEditDrawer,
    handleSubmitProduct,
  } = useInventory();

  return (
    <div className="p-6 md:p-10 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-surface border border-border shadow-2xl text-foreground text-xs font-bold uppercase tracking-wider transition-all animate-in fade-in slide-in-from-bottom-5">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <header className="flex items-center justify-between border-b border-border pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
            <Package className="text-primary w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Inventario & Menú
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Controla precios, costos de producción y disponibilidad
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-primary font-black tracking-widest uppercase text-xs">
            Cargando inventario...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-surface/40 rounded-3xl border border-border text-center p-8 shadow-sm">
          <Package className="w-16 h-16 text-muted-foreground/60 mb-4" />
          <h2 className="text-xl font-bold text-foreground">
            No hay ningún producto disponible
          </h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm mb-6">
            Comienza a armar tu menú agregando tu primer plato o producto para
            el inventario.
          </p>
          <button
            onClick={openCreateDrawer}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-primary/10">
            <Plus className="w-4 h-4" /> Agregar primer producto
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={openCreateDrawer}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-primary/10">
              <Plus className="w-4 h-4" /> Nuevo Producto
            </button>
          </div>

          <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-black text-muted-foreground uppercase tracking-widest bg-background/60 border-b border-border">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4 text-center">Precio Venta</th>
                  <th className="px-6 py-4 text-center">Costo Producción</th>
                  <th className="px-6 py-4 text-center">Utilidad Est.</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map((item) => {
                  const utilidad = item.price - (item.cost || 0);
                  const margen =
                    item.price > 0
                      ? ((utilidad / item.price) * 100).toFixed(0)
                      : 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-border/30 transition-all">
                      <td className="px-6 py-5 font-bold text-foreground">
                        {item.name}
                      </td>
                      <td className="px-6 py-5 text-center font-black text-foreground">
                        ${item.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center font-black text-muted-foreground">
                        ${(item.cost || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-black text-emerald-500 dark:text-emerald-400">
                          ${utilidad.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          ({margen}%)
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDrawer(item)}
                          className="p-2 bg-background hover:bg-border text-foreground border border-border rounded-xl transition-colors cursor-pointer"
                          title="Editar producto">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStock(item.id, item.stock)}
                          className={`px-4 py-2 rounded-xl font-black text-[10px] cursor-pointer ${
                            item.stock
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          }`}>
                          {item.stock ? "DISPONIBLE" : "AGOTADO"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Drawer de Creación / Edición */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-surface border-l border-border h-full p-8 flex flex-col justify-between shadow-2xl">
            <form onSubmit={handleSubmitProduct} className="space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h2 className="text-xl font-black text-foreground">
                  {editingProduct ? "Editar" : "Nuevo"}{" "}
                  <span className="text-primary">Plato</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <X />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
                  Nombre del Producto
                </label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-background border border-border rounded-2xl text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
                    Precio Venta (COP)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full p-4 bg-background border border-border rounded-2xl text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground block mb-2">
                    Costo Producción
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full p-4 bg-background border border-border rounded-2xl text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="stock-status"
                  checked={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.checked })
                  }
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <label
                  htmlFor="stock-status"
                  className="text-xs font-bold uppercase text-foreground cursor-pointer">
                  Disponible para la venta
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-primary/10">
                {editingProduct ? "Actualizar Producto" : "Guardar Producto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
