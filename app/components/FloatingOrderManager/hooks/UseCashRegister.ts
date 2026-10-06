"use client";

import { useEffect, useState } from "react";
import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";
import {
  closeCashRegister,
  getCashRegisterStatus,
  openCashRegister,
} from "@/app/services/cashRegisterService";

// Renombrado a camelCase (useCashRegister) — así React/Next.js lo
// reconocen correctamente como hook (Fast Refresh, rules-of-hooks).
export default function useCashRegister() {
  const { selectedRestaurantId } = useSelectedRestaurant();

  const [activeCashRegister, setActiveCashRegister] = useState<any | null>(
    null,
  );
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [suggestedBase, setSuggestedBase] = useState(100000);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashModalMode, setCashModalMode] = useState<"open" | "close">("open");
  const [loadingStatus, setLoadingStatus] = useState(false);

  // 1. Cargar el estado de caja del restaurante activo. Ya NO abre el
  // modal automáticamente — eso lo dispara el cajero con el botón
  // "Abrir Caja" que ya tienes visible en el header. Auto-abrirlo acá
  // interrumpía al usuario cada vez que este efecto se disparaba
  // (cada cambio de restaurante, cada remount del componente).
  useEffect(() => {
    if (selectedRestaurantId) {
      loadCashStatus(selectedRestaurantId);
    } else {
      // Sin restaurante activo no hay caja que mostrar — evita quedar
      // con el estado de la caja del restaurante anterior.
      setActiveCashRegister(null);
    }
  }, [selectedRestaurantId]);

  const loadCashStatus = async (restaurantId: string) => {
    setLoadingStatus(true);
    try {
      // ⚠️ Ajusta la firma real de tu servicio para que reciba
      // restaurantId — si getCashRegisterStatus() no filtra por
      // restaurante, en un SaaS multi-tenant puede traerte la caja
      // de otro restaurante que administras.
      const { activeRegister, expectedAmount, suggestedBase } =
        await getCashRegisterStatus(restaurantId);
      setActiveCashRegister(activeRegister);
      setExpectedAmount(expectedAmount);
      setSuggestedBase(suggestedBase);
    } catch (error) {
      console.error("Error al verificar estado de caja:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  // 2. Manejar el envío del Modal (Apertura o Cierre)
  const handleCashModalSubmit = async (data: any) => {
    if (!selectedRestaurantId) return;
    try {
      if (cashModalMode === "open") {
        const newRegister = await openCashRegister(
          selectedRestaurantId,
          data.initialAmount,
        );
        setActiveCashRegister(newRegister);
      } else {
        await closeCashRegister(
          selectedRestaurantId,
          activeCashRegister.id,
          data,
        );
        setActiveCashRegister(null);
      }
      setIsCashModalOpen(false);
      loadCashStatus(selectedRestaurantId);
    } catch (error) {
      console.error("Error procesando la caja:", error);
      alert("Hubo un error al guardar la caja en la base de datos.");
    }
  };

  return {
    isCashModalOpen,
    setIsCashModalOpen,
    cashModalMode,
    setCashModalMode,
    activeCashRegister,
    loadingStatus,
    expectedAmount,
    setExpectedAmount,
    suggestedBase,
    setSuggestedBase,
    setActiveCashRegister,
    handleCashModalSubmit,
  };
}
