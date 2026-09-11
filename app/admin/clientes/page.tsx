"use client";
import {
  Search,
  Users,
  Phone,
  Calendar,
  ArrowRight,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import CustomerDetailModal from "@/app/components/CustomerDetailModal/CustomerDetailModal";
import { useClients } from "./hooks/useClients";

export default function CustomersPage() {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    selectedCustomer,
    setSelectedCustomer,
    restaurantId,
    filteredCustomers,
  } = useClients();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
              <Users className="text-primary w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                Gestión y Fidelización
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Módulo de Clientes
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-2xl text-xs text-foreground outline-none focus:border-primary font-medium transition-all"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Cargando base de datos de clientes...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20 bg-surface/40 border border-border/80 rounded-3xl space-y-2">
            <UserCheck className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-foreground text-xs font-bold">
              No se encontraron clientes
            </p>
            <p className="text-muted-foreground text-[11px]">
              Los clientes se registrarán automáticamente cuando hagas pedidos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="bg-surface border border-border/80 hover:border-border rounded-3xl p-5 space-y-4 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-black text-foreground text-sm group-hover:text-primary transition-colors">
                      {customer.name}
                    </h3>
                    <span className="text-[10px] bg-background text-foreground px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-border">
                      <Phone className="w-2.5 h-2.5 text-primary" />{" "}
                      {customer.phone}
                    </span>
                  </div>

                  {customer.notes && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 bg-background/50 p-2.5 rounded-xl border border-border font-medium">
                      <strong className="text-primary uppercase text-[9px] block mb-0.5">
                        Nota:
                      </strong>
                      {customer.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/80 text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    Registrado:{" "}
                    {new Date(customer.created_at).toLocaleDateString("es-CO")}
                  </span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver historial <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCustomer && restaurantId && (
          <CustomerDetailModal
            customer={selectedCustomer}
            restaurantId={restaurantId}
            onClose={() => setSelectedCustomer(null)}
          />
        )}
      </main>
    </div>
  );
}
