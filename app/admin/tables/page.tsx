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
import { RoleGuard } from "@/app/components/Auth/RoleGuard/RoleGuard";

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

        <RoleGuard allowedRoles={["owner"]} isPage={false}>
          <button
            onClick={handleOpenCreateTable}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 self-start md:self-auto">
            <Plus className="w-4 h-4" /> Nueva Mesa
          </button>
        </RoleGuard>
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
