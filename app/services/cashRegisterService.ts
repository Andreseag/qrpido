import { supabase } from "../lib/supabase";

// 1. Obtener el estado actual de la caja y la base sugerida —
// SIEMPRE filtrado por restaurantId, para no mezclar cajas entre
// distintos restaurantes de un mismo usuario.
// Ejemplo conceptual de cómo calcular el expectedAmount en tu servicio
export async function getCashRegisterStatus(restaurantId: string) {
  // 1. Buscar la caja abierta actual del restaurante
  const { data: activeRegister, error: regError } = await supabase
    .from("cash_registers")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .is("closed_at", null) // O status = 'open'
    .single();

  if (!activeRegister) {
    return { activeRegister: null, expectedAmount: 0, suggestedBase: 100000 };
  }

  // 2. Consultar las órdenes pagadas en EFECTIVO asociadas a esta caja
  // (o creadas desde que se abrió la caja)
  const { data: cashOrders, error: ordersError } = await supabase
    .from("orders")
    .select("total_price") // 👈 Cambiado de "total" a "total_price"
    .eq("cash_register_id", activeRegister.id)
    .eq("payment_method", "efectivo") // 'cash' o 'efectivo', según cómo lo guardes en el POS
    .eq("state", "pagado"); // 👈 Cambiado de status: 'paid' a state: 'pagado'

  // 3. Sumar las ventas en efectivo
  const totalCashSales =
    cashOrders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;

  // 4. (Opcional) Sumar ingresos manuales y restar retiros manuales de caja si los hay
  // const totalManualIn = ...
  // const totalManualOut = ...

  // 5. Calcular el Efectivo Esperado en Caja:
  // Base Inicial + Ventas en Efectivo (+ Ingresos manuales - Retiros manuales)
  const initialAmount = activeRegister.initial_amount || 0;
  const expectedAmount = initialAmount + totalCashSales;

  return {
    activeRegister,
    expectedAmount,
    suggestedBase: activeRegister.suggested_base || 100000,
  };
}

// 2. Calcular el efectivo esperado en tiempo real
async function calculateExpectedAmount(
  registerId: string,
  initialAmount: number,
) {
  // OJO: "total_price" (no "total") y "efectivo" (no "cash") — así
  // se llaman de verdad esas columnas/valores en el resto de tu sistema.
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("total_price")
    .eq("cash_register_id", registerId)
    .eq("payment_method", "efectivo");

  if (ordersError) {
    console.error("Error calculando ventas en efectivo:", ordersError);
  }

  const cashSales =
    orders?.reduce((acc, order) => acc + Number(order.total_price), 0) || 0;

  const { data: movements, error: movError } = await supabase
    .from("cash_movements")
    .select("type, amount")
    .eq("cash_register_id", registerId);

  if (movError) {
    console.error("Error calculando movimientos manuales:", movError);
  }

  const manualMovements =
    movements?.reduce((acc, mov) => {
      return mov.type === "inflow"
        ? acc + Number(mov.amount)
        : acc - Number(mov.amount);
    }, 0) || 0;

  return Number(initialAmount) + cashSales + manualMovements;
}

// 3. Abrir una nueva caja — ahora sí queda asociada a su restaurante
export async function openCashRegister(
  restaurantId: string,
  initialAmount: number,
  userName?: string,
) {
  const { data, error } = await supabase
    .from("cash_registers")
    .insert([
      {
        restaurant_id: restaurantId,
        initial_amount: initialAmount,
        status: "open",
        opened_by: userName || "Cajero Principal",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 4. Cerrar la caja (Arqueo final) — el filtro por restaurantId acá es
// una capa extra de seguridad: evita que alguien cierre por error (o a
// propósito) la caja de un restaurante que no es el que tiene activo.
export async function closeCashRegister(
  restaurantId: string,
  registerId: string,
  closeData: {
    expectedAmount: number;
    finalCountedAmount: number;
    difference: number;
    nextShiftBase: number;
    withdrawnAmount: number;
    notes: string;
  },
) {
  const { data, error } = await supabase
    .from("cash_registers")
    .update({
      closed_at: new Date().toISOString(),
      expected_amount: closeData.expectedAmount,
      final_counted_amount: closeData.finalCountedAmount,
      difference: closeData.difference,
      next_shift_base: closeData.nextShiftBase,
      withdrawn_amount: closeData.withdrawnAmount,
      notes: closeData.notes,
      status: "closed",
    })
    .eq("id", registerId)
    .eq("restaurant_id", restaurantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
