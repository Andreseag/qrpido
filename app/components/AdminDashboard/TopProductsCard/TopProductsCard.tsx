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
    <div className="bg-surface/90 rounded-3xl border border-border p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h3 className="text-lg font-black text-foreground flex items-center gap-2">
          <Award className="text-amber-500 dark:text-amber-400 w-5 h-5" />{" "}
          Platos Más Solicitados
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background px-3 py-1 rounded-xl">
          Top Ranking
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Aún no hay suficientes ventas registradas para generar el ranking.
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border/80">
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                    idx === 0
                      ? "bg-amber-500 text-slate-950"
                      : idx === 1
                        ? "bg-slate-300 text-slate-900"
                        : idx === 2
                          ? "bg-amber-700 text-white"
                          : "bg-border text-muted-foreground"
                  }`}>
                  #{idx + 1}
                </span>
                <div>
                  <p className="font-bold text-foreground text-sm">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.quantity} unidades vendidas
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-amber-600 dark:text-amber-400 text-sm">
                  ${product.revenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
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
