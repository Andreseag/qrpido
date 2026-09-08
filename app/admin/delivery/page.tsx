"use client";
import { RefreshCw } from "lucide-react";
import { useDeliveryOrders } from "./hooks/useDeliveryOrders";
import { ConfigErrorScreen } from "./components/ConfigErrorScreen";
import { DeliveryHeader } from "./components/DeliveryHeader";
import { COLUMNS } from "./types";
import { KanbanColumn } from "./components/KanbanColumn";

export default function DeliveryPage() {
  const { orders, loading, configError, updateOrderState } =
    useDeliveryOrders();

  if (configError) {
    return <ConfigErrorScreen message={configError} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <DeliveryHeader orderCount={orders.length} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Cargando domicilios...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                orders={orders.filter((o) => o.state === col.id)}
                onUpdateState={updateOrderState}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
