import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { MenuTemplateProps } from "./types";

export function ElegantMenuTemplate({
  restaurantName,
  logoUrl,
  sections,
}: MenuTemplateProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex flex-col items-center text-center pt-14 pb-8 px-5">
        {logoUrl && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-border mb-4">
            <Image
              src={logoUrl}
              alt={restaurantName}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        )}
        <h1 className="text-2xl font-black tracking-[0.15em] uppercase">
          {restaurantName}
        </h1>
        <div className="w-10 h-px bg-primary mt-4" />
      </header>

      {sections.length > 1 && (
        <nav className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-5 py-3 flex justify-center gap-4 overflow-x-auto scrollbar-none">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#cat-${section.id}`}
              className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors">
              {section.name}
            </a>
          ))}
        </nav>
      )}

      <main className="max-w-lg mx-auto px-6 py-10 space-y-12">
        {sections.length === 0 ? (
          <div className="text-center py-20">
            <UtensilsCrossed className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Este restaurante aún no ha publicado su menú.
            </p>
          </div>
        ) : (
          sections.map((section) => (
            <section
              key={section.id}
              id={`cat-${section.id}`}
              className="scroll-mt-20">
              <h2 className="text-center text-xs font-black uppercase tracking-[0.25em] text-primary mb-6">
                {section.name}
              </h2>
              <div className="space-y-5">
                {section.products.map((product) => (
                  <div
                    key={product.id}
                    className={!product.stock ? "opacity-50" : ""}>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-sm text-foreground">
                        {product.name}
                      </h3>
                      <span className="flex-1 border-b border-dotted border-border translate-y-[-2px]" />
                      <span className="font-black text-sm text-primary whitespace-nowrap">
                        ${product.price.toLocaleString()}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {product.description}
                      </p>
                    )}
                    {!product.stock && (
                      <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider text-danger">
                        — Agotado —
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="text-center py-10 text-[10px] text-muted-foreground tracking-wider">
        Menú digital generado con QRPido
      </footer>
    </div>
  );
}
