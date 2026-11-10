"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";
import CashRegisterHistory from "@/app/components/CashRegisterHistory/CashRegisterHistory";
import { CashRegisterDetailModal } from "@/app/components/CashRegisterDetailModal/CashRegisterDetailModal";
import { LoadingState } from "@/app/components/LoadingState/LoadingState";

export default function CashHistoryPage() {
  const { selectedRestaurantId } = useSelectedRestaurant();
  const [registers, setRegisters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Estados para controlar el Modal y las órdenes del turno seleccionado
  const [selectedRegister, setSelectedRegister] = useState<any | null>(null);
  const [selectedRegisterOrders, setSelectedRegisterOrders] = useState<any[]>(
    [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCashHistory = useCallback(async () => {
    if (!selectedRestaurantId) {
      setRegisters([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1. Obtener todas las sesiones de caja del restaurante
      const { data: cashRegistersData, error: regError } = await supabase
        .from("cash_registers")
        .select("*")
        .eq("restaurant_id", selectedRestaurantId)
        .order("opened_at", { ascending: false });

      if (regError) throw regError;

      if (!cashRegistersData || cashRegistersData.length === 0) {
        setRegisters([]);
        setLoading(false);
        return;
      }

      // 2. Calcular las ventas en efectivo para cada caja
      const enrichedRegisters = await Promise.all(
        cashRegistersData.map(async (reg) => {
          // Intentamos buscar las órdenes por cash_register_id
          const { data: ordersData } = await supabase
            .from("orders")
            .select("total_price, payment_method, state")
            .eq("cash_register_id", reg.id);

          // Filtramos de forma más flexible (ej. aceptando 'cash' o 'efectivo')
          const cashSales =
            ordersData?.reduce((sum, order) => {
              const isCash =
                order.payment_method === "cash" ||
                order.payment_method === "efectivo";
              const isPaid = order.state === "pagado" || order.state === "paid";

              if (isCash && isPaid) {
                return sum + Number(order.total_price || 0);
              }
              return sum;
            }, 0) || 0;

          // 🚀 RESPALDO INTELIGENTE: Si no hay órdenes amarradas pero la caja ya se cerró,
          // tomamos el expected_amount o final_counted_amount como base de efectivo del turno.
          const fallbackCash =
            reg.final_counted_amount || reg.expected_amount || 0;
          const finalCashSales = cashSales > 0 ? cashSales : fallbackCash;

          return {
            ...reg,
            status: reg.closed_at ? "closed" : "open",
            cash_sales: finalCashSales,
            real_amount: reg.final_counted_amount, // Normalizamos el campo que descubrimos antes
          };
        }),
      );

      setRegisters(enrichedRegisters);
    } catch (error) {
      console.error("Error al cargar el historial de cajas:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    fetchCashHistory();
  }, [fetchCashHistory]);

  // 🚀 Al hacer clic en el botón de ver detalles en la tabla
  const handleViewDetails = async (register: any) => {
    setSelectedRegister(register);
    setIsModalOpen(true);

    // Consultar las órdenes que pertenecen a este turno de caja específico
    const { data: ordersData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("cash_register_id", register.id)
      .order("created_at", { ascending: false });

    if (!error && ordersData) {
      setSelectedRegisterOrders(ordersData);
    } else {
      setSelectedRegisterOrders([]);
    }
  };

  // 🚀 Función para cobrar una orden pendiente directamente desde el modal
  const handleProcessPayment = async (
    orderId: string,
    paymentMethod: string,
  ) => {
    const { error } = await supabase
      .from("orders")
      .update({
        state: "pagado",
        payment_method: paymentMethod,
      })
      .eq("id", orderId);

    if (error) {
      console.error("Error al cobrar la orden:", error);
      alert("Error al cobrar la orden: " + error.message);
      return;
    }

    // Actualizar la lista de órdenes en el estado local del modal al instante
    setSelectedRegisterOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, state: "pagado", payment_method: paymentMethod }
          : ord,
      ),
    );

    // Recargar el historial general para actualizar las métricas de efectivo del turno
    fetchCashHistory();
  };

  // Funciones de formato locales para el modal
  const formatCurrency = (amount: number | null | undefined) => {
    const safeAmount = Number(amount) || 0;
    return `$${safeAmount.toLocaleString("es-CO")}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <LoadingState message="Cargando historial de cajas..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Componente principal de la tabla y métricas */}
      <CashRegisterHistory
        registers={registers}
        onViewDetails={handleViewDetails}
      />

      {/* Modal de Detalle y Órdenes controlado por la página */}
      <CashRegisterDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        register={selectedRegister}
        orders={selectedRegisterOrders}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        onProcessPayment={handleProcessPayment}
      />
    </div>
  );
}
