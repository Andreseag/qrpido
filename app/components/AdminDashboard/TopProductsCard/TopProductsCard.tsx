import { Award } from "lucide-react";

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopProductsCardProps {
  products: TopProduct[];
}

export default function TopProductsCard({ products }: TopProductsCardProps) {
  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Award className="text-amber-400 w-5 h-5" /> Platos Más Solicitados
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-3 py-1 rounded-xl">
          Top Ranking
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Aún no hay suficientes ventas registradas para generar el ranking.
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                    idx === 0
                      ? "bg-amber-500 text-slate-950"
                      : idx === 1
                        ? "bg-slate-300 text-slate-950"
                        : idx === 2
                          ? "bg-amber-700 text-white"
                          : "bg-slate-800 text-slate-400"
                  }`}>
                  #{idx + 1}
                </span>
                <div>
                  <p className="font-bold text-slate-200 text-sm">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {product.quantity} unidades vendidas
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-amber-400 text-sm">
                  ${product.revenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Generados
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
