"use client";
import {
  MessageCircle,
  Users,
  Sparkles,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { useCampaigns } from "./hooks/useCampaigns";

export default function AdminCampaignsPage() {
  const {
    setFilterType,
    filterType,
    customers,
    customPromo,
    setCustomPromo,
    filteredCustomers,
    loading,
    sentLog,
    handleSendCampaign,
  } = useCampaigns();

  return (
    <div className="p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
            <MessageCircle className="text-emerald-400 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Campañas de Reenganche WhatsApp
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Reactiva clientes inactivos con mensajes personalizados en 1 clic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setFilterType("inactive")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterType === "inactive"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}>
            Inactivos (+7 días)
          </button>
          <button
            onClick={() => setFilterType("frequent")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterType === "frequent"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}>
            VIP / Frecuentes
          </button>
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}>
            Todos ({customers.length})
          </button>
        </div>
      </header>

      {/* Caja de Plantilla de Promoción */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-black uppercase text-amber-400 tracking-wider">
            Mensaje Promocional Personalizado para la Campaña
          </h2>
        </div>
        <textarea
          rows={2}
          value={customPromo}
          onChange={(e) => setCustomPromo(e.target.value)}
          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs focus:outline-none focus:border-amber-500/50"
          placeholder="Escribe la oferta o incentivo de reenganche..."
        />
        <p className="text-[10px] text-slate-500 mt-2">
          * Cada mensaje se enviará personalizado con el nombre del cliente y su
          plato favorito automáticamente al hacer clic en enviar.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-emerald-400 font-black tracking-widest uppercase text-xs">
            Cargando base de clientes...
          </p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold text-sm mb-1">
            No hay clientes en este filtro
          </h3>
          <p className="text-xs text-slate-500">
            Prueba cambiando el filtro superior para ver más registros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const isSent = sentLog[customer.id];
            return (
              <div
                key={customer.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-white font-black text-sm">
                        {customer.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {customer.phone}
                      </p>
                    </div>
                    {isSent ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ENVIADO
                      </span>
                    ) : customer.daysSinceLastOrder >= 14 ? (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1">
                        <Flame className="w-3 h-3" /> +
                        {customer.daysSinceLastOrder} DÍAS INACTIVO
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-xl text-[10px] font-black">
                        {customer.totalOrders} pedidos
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 space-y-1 mb-4 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Plato favorito:</span>
                      <span className="text-amber-400 font-bold truncate max-w-[140px]">
                        {customer.favoriteDish}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Última compra:</span>
                      <span className="text-white font-medium">
                        {customer.lastOrderDate
                          ? new Date(customer.lastOrderDate).toLocaleDateString(
                              "es-CO",
                              {
                                day: "numeric",
                                month: "short",
                              },
                            )
                          : "Nunca"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSendCampaign(customer)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20">
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                  {isSent
                    ? "Reenviar Campaña WhatsApp"
                    : "Enviar Campaña WhatsApp"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
