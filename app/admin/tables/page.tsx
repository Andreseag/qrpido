// "use client";
// import { useState, useEffect } from "react";
// import {
//   LayoutGrid,
//   Plus,
//   X,
//   Pencil,
//   Trash2,
//   Utensils,
//   Minus,
//   Check,
//   Layers,
//   AlertCircle,
//   CheckCircle2,
//   HelpCircle,
//   CreditCard,
//   Banknote,
//   Users,
//   Receipt,
//   ArrowRight,
// } from "lucide-react";
// import { supabase } from "@/app/lib/supabase";

// interface Table {
//   id: number;
//   number: number;
//   restaurant_id: number;
//   created_at: string;
// }

// interface OrderItem {
//   name: string;
//   price: number;
//   quantity: number;
// }

// interface ActiveOrder {
//   id: string;
//   table_id: number;
//   total_price: number;
//   state: string;
//   items: OrderItem[];
//   created_at: string;
//   note?: string;
// }

// interface Product {
//   id: string;
//   name: string;
//   price: number;
// }

// interface Toast {
//   message: string;
//   type: "success" | "error" | "info";
// }

// interface ConfirmDialogState {
//   isOpen: boolean;
//   title: string;
//   description: string;
//   confirmText: string;
//   type: "success" | "danger" | "warning";
//   onConfirm: () => void;
// }

// export default function AdminTablesPage() {
//   const [tables, setTables] = useState<Table[]>([]);
//   const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [restaurantId, setRestaurantId] = useState<number | null>(null);

//   // Estados para sistema de Notificaciones (Toasts Pro)
//   const [toast, setToast] = useState<Toast | null>(null);

//   // Estado para Modal de Confirmación Pro (z-[100])
//   const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(
//     null,
//   );

//   // Estados para modales de Mesas (z-50)
//   const [isTableDrawerOpen, setIsTableDrawerOpen] = useState(false);
//   const [editingTable, setEditingTable] = useState<Table | null>(null);
//   const [tableNumberInput, setTableNumberInput] = useState("");

//   // Estados para Gestión de Comanda / Rondas (z-50)
//   const [selectedTable, setSelectedTable] = useState<Table | null>(null);
//   const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
//   const [newRoundCart, setNewRoundCart] = useState<OrderItem[]>([]);
//   const [isSavingOrder, setIsSavingOrder] = useState(false);
//   const [newOrderNote, setNewOrderNote] = useState("");

//   // --- ESTADOS PARA EL MODAL DE COBRO PRO (z-[70]) ---
//   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
//   const [tipPercentage, setTipPercentage] = useState<number>(10); // 10% por defecto (estándar Colombia)
//   const [customTipInput, setCustomTipInput] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState<
//     "efectivo" | "tarjeta" | "transferencia"
//   >("efectivo");
//   const [cashReceivedInput, setCashReceivedInput] = useState("");
//   const [splitPeopleCount, setSplitPeopleCount] = useState<number>(1);

//   const showToast = (
//     message: string,
//     type: "success" | "error" | "info" = "success",
//   ) => {
//     setToast({ message, type });
//     setTimeout(() => {
//       setToast(null);
//     }, 4000);
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   const fetchAllData = async () => {
//     setLoading(true);
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();
//     if (!session) {
//       setLoading(false);
//       return;
//     }

//     const { data: restaurant } = await supabase
//       .from("restaurants")
//       .select("id")
//       .eq("owner_id", session.user.id)
//       .maybeSingle();

//     if (!restaurant) {
//       setLoading(false);
//       return;
//     }
//     setRestaurantId(restaurant.id);

//     // 1. Obtener mesas
//     const { data: tablesData } = await supabase
//       .from("tables")
//       .select("*")
//       .eq("restaurant_id", restaurant.id)
//       .order("number", { ascending: true });

//     if (tablesData) setTables(tablesData);

//     // 2. Obtener órdenes activas (excluyendo pagadas)
//     const { data: ordersData } = await supabase
//       .from("orders")
//       .select("id, table_id, total_price, state, items, note, created_at")
//       .eq("restaurant_id", restaurant.id)
//       .in("state", ["pendiente", "preparado", "listo", "entregado"]);

//     if (ordersData) setActiveOrders(ordersData as ActiveOrder[]);

//     // 3. Obtener productos del menú
//     const { data: productsData } = await supabase
//       .from("products")
//       .select("id, name, price")
//       .eq("restaurant_id", restaurant.id);

//     if (productsData) setProducts(productsData);

//     setLoading(false);
//   };

//   // --- CRUD DE MESAS ---
//   const handleOpenCreateTable = () => {
//     setEditingTable(null);
//     setTableNumberInput("");
//     setIsTableDrawerOpen(true);
//   };

//   const handleOpenEditTable = (table: Table) => {
//     setEditingTable(table);
//     setTableNumberInput(table.number ? table.number.toString() : "");
//     setIsTableDrawerOpen(true);
//   };

//   const handleSaveTable = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (restaurantId === null) return;
//     const num = parseInt(tableNumberInput);
//     if (isNaN(num)) {
//       showToast("Ingresa un número de mesa válido", "error");
//       return;
//     }

//     if (editingTable) {
//       const { error } = await supabase
//         .from("tables")
//         .update({ number: num })
//         .eq("id", editingTable.id);

//       if (error) {
//         showToast("Error al actualizar mesa: " + error.message, "error");
//       } else {
//         setTables((prev) =>
//           prev.map((t) =>
//             t.id === editingTable.id ? { ...t, number: num } : t,
//           ),
//         );
//         setIsTableDrawerOpen(false);
//         showToast("Mesa actualizada correctamente", "success");
//       }
//     } else {
//       const { data, error } = await supabase
//         .from("tables")
//         .insert([{ number: num, restaurant_id: restaurantId }])
//         .select();

//       if (error) {
//         showToast("Error al crear mesa: " + error.message, "error");
//       } else if (data) {
//         setTables([...tables, data[0]]);
//         setIsTableDrawerOpen(false);
//         showToast("Mesa creada exitosamente", "success");
//       }
//     }
//   };

//   const handleDeleteTable = (id: number) => {
//     setConfirmDialog({
//       isOpen: true,
//       title: "Eliminar Mesa",
//       description:
//         "¿Estás seguro de eliminar esta mesa? Esta acción no se puede deshacer.",
//       confirmText: "Sí, eliminar",
//       type: "danger",
//       onConfirm: async () => {
//         setConfirmDialog(null);
//         const { error } = await supabase.from("tables").delete().eq("id", id);
//         if (error) {
//           showToast("Error al eliminar la mesa", "error");
//         } else {
//           setTables((prev) => prev.filter((t) => t.id !== id));
//           showToast("Mesa eliminada", "info");
//         }
//       },
//     });
//   };

//   // --- GESTIÓN DE COMANDAS Y RONDAS ---
//   const handleOpenTableOrder = (table: Table) => {
//     setSelectedTable(table);
//     setNewRoundCart([]);
//     setNewOrderNote("");
//     setIsOrderModalOpen(true);
//   };

//   const handleAddProductToCart = (product: Product) => {
//     setNewRoundCart((prev) => {
//       const existingIndex = prev.findIndex(
//         (item) => item.name === product.name,
//       );
//       if (existingIndex > -1) {
//         return prev.map((item, idx) =>
//           idx === existingIndex
//             ? { ...item, quantity: item.quantity + 1 }
//             : item,
//         );
//       } else {
//         return [
//           ...prev,
//           { name: product.name, price: product.price, quantity: 1 },
//         ];
//       }
//     });
//   };

//   const handleRemoveItemFromCart = (index: number) => {
//     setNewRoundCart((prev) => {
//       const currentItem = prev[index];
//       if (currentItem.quantity > 1) {
//         return prev.map((item, idx) =>
//           idx === index ? { ...item, quantity: item.quantity - 1 } : item,
//         );
//       } else {
//         return prev.filter((_, i) => i !== index);
//       }
//     });
//   };

//   // ENVIAR NUEVA RONDA A COCINA
//   const handleSendNewRoundToKitchen = async () => {
//     if (!selectedTable || restaurantId === null) return;
//     if (newRoundCart.length === 0) {
//       showToast("Selecciona al menos un producto nuevo para enviar.", "error");
//       return;
//     }

//     setIsSavingOrder(true);
//     const totalPrice = newRoundCart.reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0,
//     );

//     const { data, error } = await supabase
//       .from("orders")
//       .insert([
//         {
//           restaurant_id: restaurantId,
//           table_id: selectedTable.id,
//           order_type: "mesa",
//           state: "pendiente",
//           items: newRoundCart,
//           total_price: totalPrice,
//           note: newOrderNote,
//           table_number: selectedTable.number,
//         },
//       ])
//       .select();

//     if (error) {
//       showToast("Error al enviar adición: " + error.message, "error");
//     } else if (data) {
//       setActiveOrders((prev) => [...prev, data[0] as ActiveOrder]);
//       setNewRoundCart([]);
//       setNewOrderNote("");
//       showToast("¡Nueva ronda enviada a cocina con éxito! 🚀", "success");
//     }
//     setIsSavingOrder(false);
//   };

//   // ABRIR MODAL DE PAGO PRO
//   const handleOpenPaymentModal = () => {
//     setTipPercentage(10);
//     setCustomTipInput("");
//     setPaymentMethod("efectivo");
//     setCashReceivedInput("");
//     setSplitPeopleCount(1);
//     setIsPaymentModalOpen(true);
//   };

//   // EJECUTAR COBRO Y CERRAR MESA
//   const handleConfirmAndProcessPayment = async () => {
//     if (!selectedTable) return;
//     const tableOrders = activeOrders.filter(
//       (o) => o.table_id === selectedTable.id,
//     );
//     if (tableOrders.length === 0) return;

//     setIsSavingOrder(true);
//     const orderIds = tableOrders.map((o) => o.id);

//     const { error: paymentError } = await supabase.from("payments").insert([
//       {
//         restaurant_id: restaurantId,
//         table_id: selectedTable.id,
//         amount: grandTotal, // Total neto cobrado
//         tip_amount: calculatedTip, // Propina calculada
//         payment_method: paymentMethod, // 'efectivo', 'tarjeta', o 'transferencia'
//       },
//     ]);

//     if (paymentError) {
//       showToast("Error al guardar el pago: " + paymentError.message, "error");
//       return;
//     }

//     const { error } = await supabase
//       .from("orders")
//       .update({ state: "pagado" })
//       .in("id", orderIds);

//     if (!error) {
//       setActiveOrders((prev) =>
//         prev.filter((o) => o.table_id !== selectedTable.id),
//       );
//       setIsPaymentModalOpen(false);
//       setIsOrderModalOpen(false);
//       showToast("¡Cuenta cobrada y mesa liberada con éxito! 🥂", "success");
//     } else {
//       showToast("Error al cobrar cuenta: " + error.message, "error");
//     }
//     setIsSavingOrder(false);
//   };

//   // Cálculos dinámicos para el Checkout Pro
//   const currentTableOrders = selectedTable
//     ? activeOrders.filter((o) => o.table_id === selectedTable.id)
//     : [];
//   const subtotalAmount = currentTableOrders.reduce(
//     (sum, o) => sum + o.total_price,
//     0,
//   );
//   const calculatedTip =
//     tipPercentage === -1
//       ? parseFloat(customTipInput) || 0
//       : (subtotalAmount * tipPercentage) / 100;
//   const grandTotal = subtotalAmount + calculatedTip;
//   const splitTotal =
//     splitPeopleCount > 1 ? grandTotal / splitPeopleCount : grandTotal;
//   const cashGivenNum = parseFloat(cashReceivedInput) || 0;
//   const changeAmount =
//     paymentMethod === "efectivo" && cashGivenNum >= grandTotal
//       ? cashGivenNum - grandTotal
//       : 0;

//   return (
//     <div className="p-6 md:p-10 relative">
//       {/* 1. MODAL DE CONFIRMACIÓN PRO (z-[100] - Prioridad Máxima) */}
//       {confirmDialog && confirmDialog.isOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
//           <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
//             <div className="flex items-center gap-3">
//               <div
//                 className={`p-3 rounded-2xl border ${
//                   confirmDialog.type === "danger"
//                     ? "bg-red-500/10 border-red-500/20 text-red-400"
//                     : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
//                 }`}>
//                 {confirmDialog.type === "danger" ? (
//                   <AlertCircle className="w-6 h-6" />
//                 ) : (
//                   <HelpCircle className="w-6 h-6" />
//                 )}
//               </div>
//               <div>
//                 <h3 className="text-white font-black text-base">
//                   {confirmDialog.title}
//                 </h3>
//                 <p className="text-xs text-slate-400 mt-0.5">
//                   {confirmDialog.description}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center justify-end gap-3 pt-2">
//               <button
//                 onClick={() => setConfirmDialog(null)}
//                 className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer">
//                 Cancelar
//               </button>
//               <button
//                 onClick={confirmDialog.onConfirm}
//                 className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
//                   confirmDialog.type === "danger"
//                     ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
//                     : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
//                 }`}>
//                 {confirmDialog.confirmText}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 2. MODAL DE COBRO PRO / CHECKOUT (z-[70] - Por encima del panel de mesa) */}
//       {isPaymentModalOpen && selectedTable && (
//         <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
//           <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
//             {/* Header del Checkout */}
//             <div className="flex justify-between items-center border-b border-slate-800 pb-4">
//               <div className="flex items-center gap-3">
//                 <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/20 text-emerald-400">
//                   <Receipt className="w-6 h-6" />
//                 </div>
//                 <div>
//                   <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
//                     Caja Registradora POS
//                   </span>
//                   <h2 className="text-lg font-black text-white">
//                     Cobrar Mesa #{selectedTable.number}
//                   </h2>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setIsPaymentModalOpen(false)}
//                 className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Desglose Financiero */}
//             <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
//               <div className="flex justify-between text-slate-400">
//                 <span>Subtotal Consumos:</span>
//                 <span className="font-bold text-white">
//                   ${subtotalAmount.toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between text-slate-400">
//                 <span>
//                   Propina Voluntaria (
//                   {tipPercentage === -1 ? "Personalizada" : `${tipPercentage}%`}
//                   ):
//                 </span>
//                 <span className="font-bold text-emerald-400">
//                   + ${calculatedTip.toLocaleString()}
//                 </span>
//               </div>
//               <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center">
//                 <span className="text-sm font-black text-white uppercase tracking-wider">
//                   Total a Pagar:
//                 </span>
//                 <span className="text-xl font-black text-amber-400">
//                   ${grandTotal.toLocaleString()}
//                 </span>
//               </div>
//             </div>

//             {/* Módulo de Propina Inteligente */}
//             <div>
//               <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
//                 Sugerir Propina (Servicio)
//               </label>
//               <div className="grid grid-cols-5 gap-2">
//                 {[0, 10, 15, 20].map((pct) => (
//                   <button
//                     key={pct}
//                     onClick={() => {
//                       setTipPercentage(pct);
//                       setCustomTipInput("");
//                     }}
//                     className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer border ${
//                       tipPercentage === pct
//                         ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
//                         : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
//                     }`}>
//                     {pct === 0 ? "Sin Propina" : `${pct}%`}
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => setTipPercentage(-1)}
//                   className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer border ${
//                     tipPercentage === -1
//                       ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
//                       : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
//                   }`}>
//                   Otro $
//                 </button>
//               </div>

//               {tipPercentage === -1 && (
//                 <div className="mt-3">
//                   <input
//                     type="number"
//                     placeholder="Ingresa valor de propina en pesos ($)"
//                     value={customTipInput}
//                     onChange={(e) => setCustomTipInput(e.target.value)}
//                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
//                   />
//                 </div>
//               )}
//             </div>

//             {/* Módulo de División de Cuentas (Split Bill) */}
//             <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center gap-2">
//                   <Users className="w-4 h-4 text-amber-400" />
//                   <span className="text-xs font-black text-white uppercase tracking-wider">
//                     Dividir Cuenta (Partes Iguales)
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button
//                     disabled={splitPeopleCount <= 1}
//                     onClick={() =>
//                       setSplitPeopleCount((prev) => Math.max(1, prev - 1))
//                     }
//                     className="w-7 h-7 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
//                     -
//                   </button>
//                   <span className="text-xs font-black text-amber-400 w-6 text-center">
//                     {splitPeopleCount} pers.
//                   </span>
//                   <button
//                     onClick={() => setSplitPeopleCount((prev) => prev + 1)}
//                     className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
//                     +
//                   </button>
//                 </div>
//               </div>
//               {splitPeopleCount > 1 && (
//                 <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
//                   <span>
//                     Pago por cada persona ({splitPeopleCount} personas):
//                   </span>
//                   <span className="font-black text-emerald-400 text-sm">
//                     ${Math.ceil(splitTotal).toLocaleString()}
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Métodos de Pago */}
//             <div>
//               <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2">
//                 Método de Pago Principal
//               </label>
//               <div className="grid grid-cols-3 gap-2">
//                 {[
//                   { id: "efectivo", label: "Efectivo", icon: Banknote },
//                   { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
//                   {
//                     id: "transferencia",
//                     label: "Nequi / Transf.",
//                     icon: Receipt,
//                   },
//                 ].map((m) => {
//                   const Icon = m.icon;
//                   return (
//                     <button
//                       key={m.id}
//                       onClick={() => setPaymentMethod(m.id as any)}
//                       className={`py-3 px-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer border ${
//                         paymentMethod === m.id
//                           ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10"
//                           : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
//                       }`}>
//                       <Icon className="w-5 h-5" />
//                       <span>{m.label}</span>
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* Si es efectivo, calcular cambio / vueltos */}
//               {paymentMethod === "efectivo" && (
//                 <div className="mt-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
//                   <label className="text-[10px] font-bold uppercase text-slate-400 block">
//                     Efectivo Recibido del Cliente
//                   </label>
//                   <input
//                     type="number"
//                     placeholder="Ej: 100000"
//                     value={cashReceivedInput}
//                     onChange={(e) => setCashReceivedInput(e.target.value)}
//                     className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
//                   />
//                   {cashGivenNum > 0 && (
//                     <div className="flex justify-between items-center pt-1 text-xs">
//                       <span className="text-slate-400">Cambio (Vueltos):</span>
//                       <span
//                         className={`font-black ${changeAmount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
//                         {changeAmount >= 0
//                           ? `$${changeAmount.toLocaleString()}`
//                           : "Dinero insuficiente ⚠️"}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Acciones Finales de Cobro */}
//             <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
//               <button
//                 onClick={() => setIsPaymentModalOpen(false)}
//                 className="px-5 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer">
//                 Regresar
//               </button>
//               <button
//                 disabled={
//                   isSavingOrder ||
//                   (paymentMethod === "efectivo" && cashGivenNum < grandTotal)
//                 }
//                 onClick={handleConfirmAndProcessPayment}
//                 className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-2">
//                 <Check className="w-4 h-4" />
//                 {isSavingOrder
//                   ? "Procesando..."
//                   : `Confirmar Pago de $${grandTotal.toLocaleString()} ✓`}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 3. TOAST NOTIFICATION SYSTEM PRO (z-[110]) */}
//       {toast && (
//         <div className="fixed bottom-6 right-6 z-[110] animate-in fade-in slide-in-from-bottom-5 duration-300">
//           <div
//             className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs font-bold ${
//               toast.type === "error"
//                 ? "bg-red-950/90 border-red-500/40 text-red-300 shadow-red-500/10"
//                 : toast.type === "success"
//                   ? "bg-slate-950/90 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10"
//                   : "bg-slate-950/90 border-amber-500/40 text-amber-300 shadow-amber-500/10"
//             }`}>
//             {toast.type === "error" ? (
//               <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
//             ) : toast.type === "success" ? (
//               <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
//             ) : (
//               <Layers className="w-4 h-4 text-amber-400 shrink-0" />
//             )}
//             <span>{toast.message}</span>
//           </div>
//         </div>
//       )}

//       {/* Header Principal */}
//       <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
//         <div className="flex items-center gap-3">
//           <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
//             <LayoutGrid className="text-amber-400 w-8 h-8" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-black tracking-tight text-white">
//               Salón y Gestión de Mesas (Rondas & POS)
//             </h1>
//             <p className="text-xs text-slate-400 font-medium">
//               Controla cuentas abiertas, rondas a cocina y pagos profesionales
//               en tiempo real
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={handleOpenCreateTable}
//           className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 self-start md:self-auto">
//           <Plus className="w-4 h-4" /> Nueva Mesa
//         </button>
//       </header>

//       {/* Grid de Mesas */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-32">
//           <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
//           <p className="text-amber-400 font-black tracking-widest uppercase text-xs">
//             Cargando salón...
//           </p>
//         </div>
//       ) : tables.length === 0 ? (
//         <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center">
//           <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-4" />
//           <h3 className="text-white font-bold text-sm mb-1">
//             No hay mesas configuradas
//           </h3>
//           <p className="text-xs text-slate-500 mb-6">
//             Crea tus mesas para habilitar el salón.
//           </p>
//           <button
//             onClick={handleOpenCreateTable}
//             className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider inline-flex items-center gap-2">
//             <Plus className="w-4 h-4" /> Crear Primera Mesa
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
//           {tables.map((table) => {
//             const tableOrders = activeOrders.filter(
//               (o) => o.table_id === table.id,
//             );
//             const isOccupied = tableOrders.length > 0;
//             const tableTotalPrice = tableOrders.reduce(
//               (sum, o) => sum + o.total_price,
//               0,
//             );

//             return (
//               <div
//                 key={table.id}
//                 onClick={() => handleOpenTableOrder(table)}
//                 className={`bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between transition-all cursor-pointer hover:scale-[1.01] shadow-xl group relative ${
//                   isOccupied
//                     ? "border-amber-500/60 bg-amber-500/[0.03]"
//                     : "border-slate-800 hover:border-slate-700"
//                 }`}>
//                 <div>
//                   <div className="flex items-start justify-between gap-2 mb-4">
//                     <div>
//                       <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
//                         Mesa Salón
//                       </span>
//                       <h3 className="text-white font-black text-2xl mt-0.5">
//                         #{table.number}
//                       </h3>
//                     </div>
//                     <span
//                       className={`px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 ${
//                         isOccupied
//                           ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
//                           : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
//                       }`}>
//                       <span
//                         className={`w-1.5 h-1.5 rounded-full ${
//                           isOccupied
//                             ? "bg-amber-400 animate-pulse"
//                             : "bg-emerald-400"
//                         }`}></span>
//                       {isOccupied
//                         ? `${tableOrders.length} Ronda(s)`
//                         : "DISPONIBLE"}
//                     </span>
//                   </div>

//                   {isOccupied ? (
//                     <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 mb-4 space-y-2 text-xs">
//                       <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
//                         <span className="font-bold text-amber-400 uppercase text-[10px]">
//                           Cuenta Total
//                         </span>
//                         <span className="text-amber-400 font-black text-sm">
//                           ${tableTotalPrice.toLocaleString()}
//                         </span>
//                       </div>
//                       <div className="space-y-1.5 pt-1 max-h-24 overflow-y-auto">
//                         {tableOrders.map((order, rIdx) => (
//                           <div
//                             key={order.id}
//                             className="text-[11px] bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
//                             <div className="flex justify-between text-slate-400 font-bold mb-0.5">
//                               <span>Ronda #{rIdx + 1}</span>
//                               <span className="uppercase text-[9px] text-amber-400 bg-amber-500/10 px-1 rounded">
//                                 {order.state}
//                               </span>
//                             </div>
//                             {order.items?.map((item, iIdx) => (
//                               <div
//                                 key={iIdx}
//                                 className="flex justify-between text-slate-300">
//                                 <span className="truncate pr-2">
//                                   {item.quantity}x {item.name}
//                                 </span>
//                               </div>
//                             ))}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-6 mb-4 text-center">
//                       <Utensils className="w-6 h-6 text-slate-600 mx-auto mb-2" />
//                       <p className="text-xs text-slate-500 font-medium">
//                         Mesa libre lista para tomar pedido
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
//                   <span className="text-[11px] font-bold text-amber-400 group-hover:underline flex items-center gap-1">
//                     {isOccupied ? "Ver Cuenta / Cobrar +" : "Abrir Comanda +"}
//                   </span>

//                   <div
//                     className="flex items-center gap-1"
//                     onClick={(e) => e.stopPropagation()}>
//                     <button
//                       onClick={() => handleOpenEditTable(table)}
//                       className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
//                       title="Editar número">
//                       <Pencil className="w-3.5 h-3.5" />
//                     </button>
//                     <button
//                       onClick={() => handleDeleteTable(table.id)}
//                       className="p-2 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
//                       title="Eliminar mesa">
//                       <Trash2 className="w-3.5 h-3.5" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* 4. DRAWER DETALLE DE MESA Y COMANDAS (z-50) */}
//       {isOrderModalOpen && selectedTable && (
//         <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
//           <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
//             <div>
//               <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
//                 <div>
//                   <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
//                     Administración de Cuenta por Rondas
//                   </span>
//                   <h2 className="text-xl font-black text-white">
//                     Mesa #{selectedTable.number}
//                   </h2>
//                 </div>
//                 <button
//                   onClick={() => setIsOrderModalOpen(false)}
//                   className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Rondas Previas ya enviadas */}
//               <div className="mb-6">
//                 <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
//                   <Layers className="w-4 h-4 text-amber-400" /> Rondas enviadas
//                   a cocina / Historial
//                 </h3>
//                 {activeOrders.filter((o) => o.table_id === selectedTable.id)
//                   .length === 0 ? (
//                   <p className="text-xs text-slate-500 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
//                     No hay rondas activas en esta mesa todavía.
//                   </p>
//                 ) : (
//                   <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
//                     {activeOrders
//                       .filter((o) => o.table_id === selectedTable.id)
//                       .map((order, idx) => (
//                         <div
//                           key={order.id}
//                           className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs">
//                           <div>
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="font-bold text-white">
//                                 Ronda #{idx + 1}
//                               </span>
//                               <span
//                                 className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
//                                   order.state === "pendiente"
//                                     ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
//                                     : order.state === "listo"
//                                       ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
//                                       : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
//                                 }`}>
//                                 Estado Cocina: {order.state}
//                               </span>
//                             </div>
//                             <p className="text-[11px] text-slate-400">
//                               {order.items
//                                 ?.map((i) => `${i.quantity}x ${i.name}`)
//                                 .join(", ")}
//                             </p>
//                             {order.note && (
//                               <p className="text-[10px] text-amber-300/80 italic mt-0.5">
//                                 Nota: {order.note}
//                               </p>
//                             )}
//                           </div>
//                           <span className="font-black text-amber-400 text-sm">
//                             ${order.total_price.toLocaleString()}
//                           </span>
//                         </div>
//                       ))}
//                   </div>
//                 )}
//               </div>

//               {/* Selector de Nueva Adición (Siguiente Ronda) */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-5">
//                 {/* Carrito de Nuevos Ítems */}
//                 <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col h-[260px]">
//                   <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider mb-2 flex items-center justify-between">
//                     <span>Nueva Adición (Pedido Extra)</span>
//                     <span>
//                       {newRoundCart.reduce((acc, i) => acc + i.quantity, 0)}{" "}
//                       items
//                     </span>
//                   </h3>

//                   <div className="flex-1 overflow-y-auto space-y-2 pr-1">
//                     {newRoundCart.length === 0 ? (
//                       <p className="text-center text-slate-500 text-xs italic py-12">
//                         Selecciona productos del menú de la derecha para agregar
//                         a esta nueva ronda.
//                       </p>
//                     ) : (
//                       newRoundCart.map((item, idx) => (
//                         <div
//                           key={idx}
//                           className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
//                           <div className="truncate pr-2">
//                             <p className="text-xs font-bold text-white truncate">
//                               {item.name}
//                             </p>
//                             <p className="text-[10px] text-amber-400">
//                               ${(item.price * item.quantity).toLocaleString()}
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-2 shrink-0">
//                             <span className="text-xs font-black text-slate-300 w-5 text-center">
//                               {item.quantity}
//                             </span>
//                             <button
//                               onClick={() => handleRemoveItemFromCart(idx)}
//                               className="w-6 h-6 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer">
//                               <Minus className="w-3 h-3" />
//                             </button>
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>

//                   <div className="mt-2">
//                     <input
//                       type="text"
//                       placeholder="Nota para esta ronda (ej: Extra salsa)"
//                       value={newOrderNote}
//                       onChange={(e) => setNewOrderNote(e.target.value)}
//                       className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
//                     />
//                   </div>
//                 </div>

//                 {/* Menú para agregar */}
//                 <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col h-[260px]">
//                   <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
//                     Menú Disponible
//                   </h3>

//                   <div className="flex-1 overflow-y-auto space-y-2 pr-1">
//                     {products.length === 0 ? (
//                       <p className="text-center text-slate-500 text-xs italic py-12">
//                         No hay productos en el menú.
//                       </p>
//                     ) : (
//                       products.map((prod) => (
//                         <div
//                           key={prod.id}
//                           onClick={() => handleAddProductToCart(prod)}
//                           className="flex items-center justify-between bg-slate-900 hover:bg-slate-800/80 p-2 rounded-xl border border-slate-800 transition-all cursor-pointer group">
//                           <div className="truncate pr-2">
//                             <p className="text-xs font-bold text-white group-hover:text-amber-400 truncate">
//                               {prod.name}
//                             </p>
//                             <p className="text-[10px] text-slate-400">
//                               ${prod.price.toLocaleString()}
//                             </p>
//                           </div>
//                           <div className="w-6 h-6 bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 rounded-lg flex items-center justify-center transition-all shrink-0">
//                             <Plus className="w-3.5 h-3.5" />
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Acciones del Modal Lateral */}
//             <div className="pt-5 border-t border-slate-800 space-y-3">
//               <div className="flex justify-between items-center text-sm font-black text-white px-1">
//                 <span>Total Acumulado de la Mesa:</span>
//                 <span className="text-amber-400 text-base">
//                   $
//                   {(
//                     activeOrders
//                       .filter((o) => o.table_id === selectedTable.id)
//                       .reduce((sum, o) => sum + o.total_price, 0) +
//                     newRoundCart.reduce(
//                       (sum, i) => sum + i.price * i.quantity,
//                       0,
//                     )
//                   ).toLocaleString()}
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <button
//                   disabled={isSavingOrder || newRoundCart.length === 0}
//                   onClick={handleSendNewRoundToKitchen}
//                   className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 py-3 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2">
//                   <Check className="w-4 h-4" />
//                   {isSavingOrder ? "Enviando..." : "Enviar Adición 🚀"}
//                 </button>

//                 {activeOrders.some((o) => o.table_id === selectedTable.id) && (
//                   <button
//                     onClick={handleOpenPaymentModal}
//                     className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5">
//                     <span>Ir a Cobrar POS</span>
//                     <ArrowRight className="w-4 h-4" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 5. DRAWER CREAR / EDITAR MESA (z-50) */}
//       {isTableDrawerOpen && (
//         <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
//           <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-8 flex flex-col justify-between shadow-2xl">
//             <form onSubmit={handleSaveTable} className="space-y-6">
//               <div className="flex justify-between items-center border-b border-slate-800 pb-4">
//                 <h2 className="text-xl font-black text-white">
//                   {editingTable ? "Editar" : "Nueva"}{" "}
//                   <span className="text-amber-400">Mesa</span>
//                 </h2>
//                 <button
//                   type="button"
//                   onClick={() => setIsTableDrawerOpen(false)}
//                   className="text-slate-400 hover:text-white cursor-pointer">
//                   <X />
//                 </button>
//               </div>

//               <div>
//                 <label className="text-xs font-bold uppercase text-slate-400 block mb-2">
//                   Número de Mesa
//                 </label>
//                 <input
//                   required
//                   type="number"
//                   min="1"
//                   className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-lg font-bold focus:outline-none focus:border-amber-500"
//                   placeholder="Ej: 5"
//                   value={tableNumberInput}
//                   onChange={(e) => setTableNumberInput(e.target.value)}
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all">
//                 {editingTable ? "Actualizar Mesa" : "Guardar Mesa"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import { useAdminTables } from "./hooks/useAdminTables";
import { Table, OrderItem, PaymentMethod } from "./types";
import { ConfirmDialog } from "@/app/components/ConfirmDialog/ConfirmDialog";
import { PaymentModal } from "@/app/components/Tables/PaymentModal/PaymentModal";
import { Toast } from "@/app/components/Toast/Toast";
import { TableOrderDrawer } from "@/app/components/Tables/TableOrderDrawer/TableOrderDrawer";
import { TableCard } from "@/app/components/Tables/TableCard/TableCard";
import { TableFormDrawer } from "@/app/components/Tables/TableFormDrawer/TableFormDrawer";

export default function AdminTablesPage() {
  const {
    tables,
    activeOrders,
    products,
    loading,
    isSaving,
    toast,
    showToast,
    confirmDialog,
    setConfirmDialog,
    createTable,
    updateTable,
    deleteTable,
    sendNewRound,
    processPayment,
  } = useAdminTables();

  // Drawer crear/editar mesa
  const [isTableDrawerOpen, setIsTableDrawerOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Mesa seleccionada / comanda / pago
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleOpenCreateTable = () => {
    setEditingTable(null);
    setIsTableDrawerOpen(true);
  };

  const handleOpenEditTable = (table: Table) => {
    setEditingTable(table);
    setIsTableDrawerOpen(true);
  };

  const handleSaveTable = async (number: number) => {
    if (editingTable) {
      return updateTable(editingTable.id, number);
    }
    return createTable(number);
  };

  const handleOpenTableOrder = (table: Table) => {
    setSelectedTable(table);
    setIsOrderModalOpen(true);
  };

  const selectedTableOrders = selectedTable
    ? activeOrders.filter((o) => o.table_id === selectedTable.id)
    : [];

  const handleSendRound = async (cart: OrderItem[], note: string) => {
    if (!selectedTable) return false;
    return sendNewRound(selectedTable.id, selectedTable.number, cart, note);
  };

  const handleConfirmPayment = async (
    grandTotal: number,
    tipAmount: number,
    paymentMethod: PaymentMethod,
  ) => {
    if (!selectedTable) return;
    const success = await processPayment(
      selectedTable.id,
      grandTotal,
      tipAmount,
      paymentMethod,
    );
    if (success) {
      setIsPaymentModalOpen(false);
      setIsOrderModalOpen(false);
    }
  };

  return (
    <div className="p-6 md:p-10 relative">
      <ConfirmDialog
        dialog={confirmDialog}
        onCancel={() => setConfirmDialog(null)}
      />

      {selectedTable && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          tableNumber={selectedTable.number}
          tableOrders={selectedTableOrders}
          isSaving={isSaving}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleConfirmPayment}
        />
      )}

      <Toast toast={toast} />

      {/* Header Principal */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
            <LayoutGrid className="text-amber-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Salón y Gestión de Mesas (Rondas & POS)
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Controla cuentas abiertas, rondas a cocina y pagos profesionales
              en tiempo real
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateTable}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Nueva Mesa
        </button>
      </header>

      {/* Grid de Mesas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p className="text-amber-400 font-black tracking-widest uppercase text-xs">
            Cargando salón...
          </p>
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center">
          <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-sm mb-1">
            No hay mesas configuradas
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Crea tus mesas para habilitar el salón.
          </p>
          <button
            onClick={handleOpenCreateTable}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Crear Primera Mesa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              tableOrders={activeOrders.filter((o) => o.table_id === table.id)}
              onOpen={handleOpenTableOrder}
              onEdit={handleOpenEditTable}
              onDelete={deleteTable}
            />
          ))}
        </div>
      )}

      <TableOrderDrawer
        isOpen={isOrderModalOpen}
        table={selectedTable}
        tableOrders={selectedTableOrders}
        products={products}
        isSaving={isSaving}
        onClose={() => setIsOrderModalOpen(false)}
        onSendRound={handleSendRound}
        onOpenPayment={() => setIsPaymentModalOpen(true)}
      />

      <TableFormDrawer
        isOpen={isTableDrawerOpen}
        editingTable={editingTable}
        onClose={() => setIsTableDrawerOpen(false)}
        onSave={handleSaveTable}
        onInvalidNumber={() =>
          showToast("Ingresa un número de mesa válido", "error")
        }
      />
    </div>
  );
}
