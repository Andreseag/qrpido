"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Phone,
  Calendar,
  ArrowRight,
  UserCheck,
  RefreshCw,
  ChefHat,
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import CustomerDetailModal from "@/app/components/CustomerDetailModal/CustomerDetailModal";

interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", session.user.id)
      .maybeSingle();

    if (!restaurant) {
      setLoading(false);
      return;
    }

    setRestaurantId(restaurant.id);

    // Se usa restaurant.id directamente para evitar el problema de estado asíncrono
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });

    if (data) {
      setCustomers(data);
    }
    setLoading(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm),
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
              <Users className="text-amber-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Gestión y Fidelización
                {/* <span className="text-amber-400 font-medium text-xs px-2.5 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                  KDS Live
                </span> */}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Módulo de Clientes
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white outline-none focus:border-amber-500 font-medium transition-all"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              Cargando base de datos de clientes...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-2">
            <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-xs font-bold">
              No se encontraron clientes
            </p>
            <p className="text-slate-500 text-[11px]">
              Los clientes se registrarán automáticamente cuando hagas pedidos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-5 space-y-4 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between shadow-xl">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-black text-white text-sm group-hover:text-amber-400 transition-colors">
                      {customer.name}
                    </h3>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-amber-400" />{" "}
                      {customer.phone}
                    </span>
                  </div>

                  {customer.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 font-medium">
                      <strong className="text-amber-400 uppercase text-[9px] block mb-0.5">
                        Nota:
                      </strong>
                      {customer.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Registrado:{" "}
                    {new Date(customer.created_at).toLocaleDateString("es-CO")}
                  </span>
                  <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
