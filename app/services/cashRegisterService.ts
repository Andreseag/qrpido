import { supabase } from "../lib/supabase";

// 1. Obtener el estado actual de la caja y la base sugerida —
// SIEMPRE filtrado por restaurantId, para no mezclar cajas entre
// distintos restaurantes de un mismo usuario.
export async function getCashRegisterStatus(restaurantId: string) {
  const { data: activeRegister, error: activeError } = await supabase
    .from("cash_registers")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("status", "open")
    .maybeSingle();

  if (activeError) throw activeError;

  let expectedAmount = 0;

  if (activeRegister) {
    expectedAmount = await calculateExpectedAmount(
      activeRegister.id,
      activeRegister.initial_amount,
    );
  }

  // Última caja CERRADA de ESTE restaurante, para heredar la base
  // sugerida del siguiente turno.
  const { data: lastClosed, error: closedError } = await supabase
    .from("cash_registers")
    .select("next_shift_base")
    .eq("restaurant_id", restaurantId)
    .eq("status", "closed")
    .order("closed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (closedError) console.error("Error buscando base anterior:", closedError);

  const suggestedBase = lastClosed?.next_shift_base ?? 100000;

  return {
    activeRegister,
    expectedAmount,
    suggestedBase,
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
