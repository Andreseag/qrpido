"use client";
import { use, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Producto {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  stock: boolean;
  upsell_id?: string;
}

export default function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);

  // 1. "Abrimos" la promesa de params usando React.use()
  const resolvedParams = use(params);

  // 2. Extraemos el slug y le aseguramos a TS que es un string
  const slug = resolvedParams.slug;

  // 3. Creamos una versión limpia para mostrar en el título (opcional pero recomendado)
  const nombreRestaurante = slug ? slug.replace(/-/g, " ") : "Restaurante";

  useEffect(() => {
    // 1. Cargar productos iniciales
    const fetchProductos = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("stock", true);
      setProductos(data || []);
    };

    fetchProductos();

    // 2. Escuchar cambios en TIEMPO REAL
    const channel = supabase
      .channel("cambios-inventario")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          // Si el stock cambia en el backend, actualizamos la lista aquí sin recargar
          fetchProductos();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-qrpido-blue">
        Bienvenido a {nombreRestaurante}
      </h1>
      <div className="grid gap-4 mt-6">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-qrpido-blue">
            <h3 className="font-semibold">{producto.name}</h3>
            <p className="text-gray-500">${producto.price}</p>
            <button className="mt-2 bg-qrpido-blue text-white px-4 py-2 rounded-lg w-full">
              Añadir a la orden
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
