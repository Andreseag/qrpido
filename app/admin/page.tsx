"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Store,
  LogOut,
  RefreshCcw,
  CircleDot,
  Plus,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import TablesManager from "../components/TablesManager/TablesManager";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: boolean; // Mantenemos el nombre que definas en tu interfaz
  upsell_id?: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [nombreRestaurante, setNombreRestaurante] = useState("Cargando...");
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: true,
  });
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // 🛡️ Validación de Sesión
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

  // 📦 Carga de Inventario (Versión Blindada 2026)
  const fetchInventory = async () => {
    // 1. Verificación de seguridad inicial
    if (!user?.id) return;
    setLoading(true);

    try {
      // 2. Buscamos el restaurante asociado al usuario logueado
      const { data: restaurant, error: restError } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("owner_id", user.id)
        .maybeSingle(); // Trae un solo objeto, no un array

      // Si no existe el restaurante o hay error, salimos con elegancia
      if (restError || !restaurant) {
        console.warn("Aviso: No se encontró un restaurante para este usuario.");
        setNombreRestaurante("Sin Restaurante Asignado");
        setProducts([]);
        setLoading(false);
        return;
      }

      console.log("✅ Restaurante cargado:", restaurant.name);
      console.log(
        "🆔 ID del Restaurante (Este debe ir al payload):",
        restaurant.id,
      );
      console.log("👤 Tu ID de Usuario (auth.uid):", user.id);

      // 3. Si todo bien, actualizamos el nombre en la interfaz
      setNombreRestaurante(restaurant.name);
      setRestaurantId(restaurant.id); // Guardamos el ID para futuras operaciones (ej: creación de productos)

      // 4. Cargamos los productos filtrando por el ID del restaurante encontrado
      const { data: productsData, error: prodError } = await supabase
        .from("products")
        .select("*")
        .eq("restaurant_id", restaurant.id) // <--- El "tatuaje" que los une
        .order("name");

      if (prodError) throw prodError;

      // 5. Mapeamos los datos para que coincidan con tu interfaz 'Product'
      // (Asegúrate que en Supabase las columnas se llamen 'name', 'price', 'stock')
      const formattedProducts: Product[] = (productsData || []).map(
        (p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock, // Si en Supabase es 'stock_disponible', cámbialo aquí
          upsell_id: p.upsell_id,
        }),
      );

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error crítico en fetchInventory:", error);
    } finally {
      // 6. Siempre apagamos el loader, pase lo que pase
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchInventory();
  }, [user]);

  // ⚡ Toggle de Stock (Optimista)
  const toggleStock = async (id: string, currentStatus: boolean) => {
    // Actualización local inmediata para feedback instantáneo
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: !currentStatus } : p)),
    );

    const { error } = await supabase
      .from("products")
      .update({ stock: !currentStatus }) // Asegúrate que en Supabase se llame 'stock'
      .eq("id", id);

    if (error) {
      alert("Error al actualizar el stock");
      fetchInventory(); // Revertimos si falla
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return alert("Error: No se encontró ID del restaurante");

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          stock: newProduct.stock,
          restaurant_id: restaurantId, // <--- Vinculación automática
        },
      ])
      .select();

    if (error) {
      alert("Error al crear: " + error.message);
    } else {
      // Actualizamos la lista local, cerramos panel y reseteamos
      setProducts([...products, data[0]]);
      setIsDrawerOpen(false);
      setNewProduct({ name: "", price: "", stock: true });
    }
  };

  if (!user || loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-qrpido-soft border-t-qrpido-blue rounded-full animate-spin mb-4"></div>
        <p className="text-qrpido-blue font-black animate-qrpido">
          Sincronizando Dashboard...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground">
      {/* 🧭 Navbar Superior */}
      <nav className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-qrpido-blue p-2 rounded-xl">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight">
                QRPido <span className="text-qrpido-blue">Admin</span>
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <CircleDot className="w-2 h-2 text-green-500 animate-pulse" />
                Live Cloud
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right mr-4">
              <p className="text-xs font-bold text-slate-400 uppercase">
                Restaurante
              </p>
              <p className="font-bold text-qrpido-blue">{nombreRestaurante}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-colors text-slate-400">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {/* 📊 Métricas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-qrpido-soft rounded-2xl text-qrpido-blue">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">
                  Total Productos
                </p>
                <p className="text-2xl font-black">{products.length}</p>
              </div>
            </div>
          </div>
          {/* Aquí podrías añadir más métricas como 'Pedidos hoy' o 'Ventas' */}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="btn-primary mb-4">
            <Plus className="w-5 h-5" /> Nuevo Producto
          </button>
        </div>

        {/* 📋 Tabla de Inventario */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Store className="text-qrpido-blue" /> Control de Inventario
            </h3>
            <button
              onClick={fetchInventory}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <RefreshCcw className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-8 py-5">Producto</th>
                  <th className="px-8 py-5 text-center">Precio</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-qrpido-blue transition-colors">
                        {item.name}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-center font-black text-slate-500">
                      ${item.price.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => toggleStock(item.id, item.stock)}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] tracking-tighter transition-all shadow-md ${
                          item.stock
                            ? "bg-qrpido-blue text-white shadow-blue-500/20 hover:shadow-blue-500/40"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 opacity-60"
                        }`}>
                        {item.stock ? "🟢 DISPONIBLE" : "🔴 AGOTADO"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🛡️ Drawer de Creación (Slide-over) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Fondo oscuro con desenfoque */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}></div>

          {/* Panel Blanco */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic">
                Añadir <span className="text-qrpido-blue">Plato</span>
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">
                  Nombre del Producto
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Hamburguesa Especial"
                  className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-qrpido-blue transition-all"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest">
                  Precio (COP)
                </label>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-qrpido-blue transition-all"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-qrpido-soft rounded-2xl">
                <span className="font-bold text-qrpido-blue">
                  Disponible al instante
                </span>
                <input
                  type="checkbox"
                  className="w-6 h-6 accent-qrpido-blue"
                  checked={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.checked })
                  }
                />
              </div>

              <button type="submit" className="w-full btn-primary py-4 text-lg">
                Guardar en el Menú
              </button>
            </form>
          </div>
        </div>
      )}

      <TablesManager />
    </div>
  );
}
