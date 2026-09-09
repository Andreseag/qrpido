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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-white text-xs font-bold uppercase tracking-wider transition-all animate-in fade-in slide-in-from-bottom-5">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <header className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
            <Package className="text-amber-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Inventario & Menú
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Controla precios, costos de producción y disponibilidad
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p className="text-amber-400 font-black tracking-widest uppercase text-xs">
            Cargando inventario...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-900/40 rounded-3xl border border-slate-900 text-center p-8">
          <Package className="w-16 h-16 text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-300">
            No hay ningún producto disponible
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mb-6">
            Comienza a armar tu menú agregando tu primer plato o producto para
            el inventario.
          </p>
          <button
            onClick={openCreateDrawer}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10">
            <Plus className="w-4 h-4" /> Agregar primer producto
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={openCreateDrawer}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10">
              <Plus className="w-4 h-4" /> Nuevo Producto
            </button>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-950/60 border-b border-slate-800">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4 text-center">Precio Venta</th>
                  <th className="px-6 py-4 text-center">Costo Producción</th>
                  <th className="px-6 py-4 text-center">Utilidad Est.</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((item) => {
                  const utilidad = item.price - (item.cost || 0);
                  const margen =
                    item.price > 0
                      ? ((utilidad / item.price) * 100).toFixed(0)
                      : 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-all">
                      <td className="px-6 py-5 font-bold text-slate-200">
                        {item.name}
                      </td>
                      <td className="px-6 py-5 text-center font-black text-white">
                        ${item.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center font-black text-slate-400">
                        ${(item.cost || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-black text-emerald-400">
                          ${utilidad.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ({margen}%)
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDrawer(item)}
                          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                          title="Editar producto">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStock(item.id, item.stock)}
                          className={`px-4 py-2 rounded-xl font-black text-[10px] cursor-pointer ${
                            item.stock
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
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
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-8 flex flex-col justify-between shadow-2xl">
            <form onSubmit={handleSubmitProduct} className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-xl font-black text-white">
                  {editingProduct ? "Editar" : "Nuevo"}{" "}
                  <span className="text-amber-400">Plato</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer">
                  <X />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-2">
                  Nombre del Producto
                </label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-2">
                    Precio Venta (COP)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 block mb-2">
                    Costo Producción
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm"
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
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label
                  htmlFor="stock-status"
                  className="text-xs font-bold uppercase text-slate-300 cursor-pointer">
                  Disponible para la venta
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer">
                {editingProduct ? "Actualizar Producto" : "Guardar Producto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
