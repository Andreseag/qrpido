"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import AdminSidebar from "../components/AdminSidebar/AdminSidebar";
import FloatingOrderManager from "../components/FloatingOrderManager/FloatingOrderManager";
// import FloatingWhatsAppChat from "../components/FloatingWhatsAppChat/FloatingWhatsAppChat";
// import WhatsAppFloatingWidget from "../components/WhatsAppFloatingWidget/WhatsAppFloatingWidget";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [orderManagerOpen, setOrderManagerOpen] = useState(false);
  const [clientDataToOrder, setClientDataToOrder] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  useEffect(() => {
    const checkAuthAndRestaurant = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: member, error } = await supabase
        .from("restaurant_members")
        .select("restaurant_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (member) {
        setRestaurantId(member.restaurant_id);
      }
      setLoading(false);
    };

    checkAuthAndRestaurant();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* El Sidebar permanece fijo en todo el sistema admin */}
      <AdminSidebar />

      {/* Contenido dinámico de la página actual */}
      <main className="flex-1 overflow-y-auto min-h-screen">{children}</main>

      {/* 🟢 1. El Chat Flotante de WhatsApp */}
      {/* <FloatingWhatsAppChat
        onConvertToOrder={(clientData) => {
          // Guardamos los datos del cliente que vienen del chat
          setClientDataToOrder(clientData);
          // Abrimos automáticamente el creador de pedidos
          setOrderManagerOpen(true);
        }}
      /> */}

      {/* 🟢 2. Tu Gestor de Pedidos Flotante */}
      <FloatingOrderManager
        isOpen={orderManagerOpen}
        onClose={() => setOrderManagerOpen(false)}
        initialClientData={clientDataToOrder} // Le pasamos el nombre y teléfono autocompletados
        restaurantId={restaurantId}
      />
      {/* <WhatsAppFloatingWidget restaurantId={restaurantId} /> */}
    </div>
  );
}
