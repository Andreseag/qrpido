import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { MenuTemplateProps } from "./types";

export function GridMenuTemplate({
  restaurantName,
  logoUrl,
  sections,
}: MenuTemplateProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero centrado con el logo, no sticky — este layout prioriza
          las fotos de los platos por encima de la navegación fija */}
      <header className="flex flex-col items-center text-center pt-10 pb-6 px-5">
        {logoUrl ? (
          <div className="relative w-20 h-20 rounded-3xl overflow-hidden border border-border shadow-lg mb-3">
            <Image
              src={logoUrl}
              alt={restaurantName}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : null}
        <h1 className="text-2xl font-black tracking-tight">{restaurantName}</h1>
      </header>

      {sections.length > 1 && (
        <nav className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border px-5 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#cat-${section.id}`}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
              {section.name}
            </a>
          ))}
        </nav>
      )}

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-12">
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
              <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-4 px-1">
                {section.name}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {section.products.map((product) => (
                  <article
                    key={product.id}
                    className={`bg-surface border border-border rounded-2xl overflow-hidden flex flex-col ${
                      !product.stock ? "opacity-60" : ""
                    }`}>
                    <div className="relative aspect-square bg-background">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 300px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UtensilsCrossed className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                      {!product.stock && (
                        <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider bg-danger text-white px-2 py-0.5 rounded-full">
                          Agotado
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="font-bold text-xs text-foreground leading-tight">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 flex-1">
                          {product.description}
                        </p>
                      )}
                      <span className="font-black text-sm text-primary mt-2">
                        ${product.price.toLocaleString()}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="text-center py-8 text-[10px] text-muted-foreground">
        Menú digital generado con QRPido
      </footer>
    </div>
  );
}
