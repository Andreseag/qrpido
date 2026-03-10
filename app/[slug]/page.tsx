"use client";
import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ShoppingBag,
  Plus,
  Minus,
  Search,
  ChevronRight,
  CheckCircle2,
  Utensils,
  AlertCircle,
} from "lucide-react";

/**
 * QRPido Customer Experience (TSX Version)
 * Interfaz para que el comensal escanee, vea el menú y ordene.
 */

// --- Interfaces ---
interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface CustomerOrderingProps {
  restaurantId?: string;
  tableId?: string;
  tableNumber?: string;
}

type OrderStatus = "idle" | "sending" | "success" | "error";

export default function CustomerOrdering({
  restaurantId = "1",
  tableId = "6",
  tableNumber = "5",
}: CustomerOrderingProps) {
  const [supabase, setSupabase] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [configError, setConfigError] = useState<string | null>(null);

  // 1. Inicialización de Supabase con validación de credenciales
  useEffect(() => {
    const loadSupabase = async () => {
      try {
        const supabaseUrl =
          (window as any).__env?.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey =
          (window as any).__env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error(
            "Supabase URL and Anon Key are required to initialize the app.",
          );
        }

        const client = createClient(supabaseUrl, supabaseAnonKey);
        setSupabase(client);
      } catch (err: any) {
        console.error("Config Error:", err.message);
        setConfigError(err.message);
        setLoading(false);
      }
    };
    loadSupabase();
  }, []);

  // 2. Carga de datos del Menú
  useEffect(() => {
    if (!supabase || !restaurantId) return;

    const fetchMenu = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("stock", true);

      if (error) {
        console.error("Error fetching menu:", error);
      } else if (data) {
        setMenuItems(data as MenuItem[]);
        const cats = [
          "todos",
          ...new Set((data as MenuItem[]).map((item) => item.category)),
        ];
        setCategories(cats);
      }
      setLoading(false);
    };

    fetchMenu();
  }, [supabase, restaurantId]);

  // 3. Lógica del Carrito
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.quantity === 1)
        return prev.filter((i) => i.id !== id);
      return prev.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity - 1 } : i,
      );
    });
  };

  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // 4. Enviar Pedido a Cocina
  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !supabase) return;
    setOrderStatus("sending");

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            restaurant_id: restaurantId,
            table_id: tableId,
            total_price: cartTotal,
            state: "pendiente",
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      if (order) {
        const orderItems = cart.map((item) => ({
          order_id: order.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        setOrderStatus("success");
        setCart([]);
      }
    } catch (err) {
      console.error("Error al pedir:", err);
      setOrderStatus("error");
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "todos" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, activeCategory]);

  // Manejo de Error de Configuración
  if (configError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-sm">
          <AlertCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">
            Error de Conexión
          </h2>
          <p className="text-slate-400 text-sm mb-0">
            No se detectaron las credenciales de Supabase necesarias para
            operar.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-400 font-black animate-pulse uppercase tracking-widest text-xs">
            Cargando Menú...
          </p>
        </div>
      </div>
    );
  }

  if (orderStatus === "success") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-xs animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/20">
            <CheckCircle2 className="text-white w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            ¡Pedido Recibido!
          </h2>
          <p className="text-slate-400 font-medium mb-8">
            Tu orden para la{" "}
            <span className="text-blue-400 font-black">Mesa {tableNumber}</span>{" "}
            ya está en cocina.
          </p>
          <button
            onClick={() => setOrderStatus("idle")}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-900/20">
            PEDIR ALGO MÁS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="text-blue-500">QR</span>Pido
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Mesa {tableNumber}
            </p>
          </div>
          <div className="bg-blue-600/10 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
              Abierto
            </span>
          </div>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            size={18}
          />
          <input
            type="text"
            placeholder="¿Qué se te antoja hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder:text-slate-700"
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="flex gap-2 overflow-x-auto p-5 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Menú */}
      <div className="p-5 grid grid-cols-1 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#1E293B] rounded-3xl p-4 flex gap-4 border border-slate-800/50 hover:border-blue-500/30 transition-colors">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-24 h-24 rounded-2xl object-cover shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                  <Utensils className="text-slate-800" size={32} />
                </div>
              )}

              <div className="flex flex-col justify-between py-1 flex-1">
                <div>
                  <h3 className="font-black text-white text-base leading-tight mb-1">
                    {item.name}
                  </h3>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-black text-blue-400">
                    ${item.price.toLocaleString()}
                  </span>

                  {cart.find((i) => i.id === item.id) ? (
                    <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                        <Minus size={14} />
                      </button>
                      <span className="font-black text-sm w-4 text-center">
                        {cart.find((i) => i.id === item.id)?.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg text-white">
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-900/20">
                      <Plus size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-40">
            <Utensils size={48} className="mx-auto mb-4" />
            <p className="font-bold">No encontramos platos disponibles</p>
          </div>
        )}
      </div>

      {/* Carrito Flotante */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-40 animate-in slide-in-from-bottom-10 duration-500">
          <button
            onClick={handlePlaceOrder}
            disabled={orderStatus === "sending"}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-[2rem] shadow-2xl shadow-blue-900/50 flex items-center justify-between transform active:scale-95 transition-all disabled:opacity-50">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center relative">
                <ShoppingBag size={20} />
                <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  Ver mi orden
                </p>
                <p className="text-sm font-black">CONTINUAR PEDIDO</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black">
                ${cartTotal.toLocaleString()}
              </span>
              <ChevronRight size={24} />
            </div>
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {orderStatus === "sending" && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-10">
          <div className="w-16 h-16 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Enviando a Cocina
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-2">
            Estamos marchando tu orden...
          </p>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
