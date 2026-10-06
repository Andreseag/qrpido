// "use client";

import Image from "next/image";
import { Store, UtensilsCrossed } from "lucide-react";
import { MenuTemplateProps } from "./types";
// import { useState } from "react";

export function ClassicMenuTemplate({
  restaurantName,
  logoUrl,
  sections,
}: MenuTemplateProps) {
  // Estados para controlar el modal del plato seleccionado
  // const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // const handleOpenProduct = (product: any) => {
  //   setSelectedProduct(product);
  //   setIsModalOpen(true);
  // };

  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  //   setSelectedProduct(null);
  // };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-5 py-5 flex items-center gap-3">
          {logoUrl ? (
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-border shrink-0">
              <Image
                src={logoUrl}
                alt={restaurantName}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="bg-primary/10 p-2.5 rounded-2xl border border-primary/20">
              <Store className="w-6 h-6 text-primary" />
            </div>
          )}
          <h1 className="text-xl font-black tracking-tight">
            {restaurantName}
          </h1>
        </div>

        {sections.length > 1 && (
          <nav className="max-w-2xl mx-auto px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
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
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-10">
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
              className="scroll-mt-32">
              <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-4">
                {section.name}
              </h2>
              <div className="space-y-4">
                {section.products.map((product) => (
                  <article
                    key={product.id}
                    className={`flex gap-4 bg-surface border border-border rounded-2xl p-3 ${
                      !product.stock ? "opacity-60" : ""
                    }`}>
                    {product.image_url && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-background">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-foreground">
                          {product.name}
                        </h3>
                        <span className="font-black text-sm text-primary whitespace-nowrap">
                          ${product.price.toLocaleString()}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      {!product.stock && (
                        <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-wider bg-danger/10 text-danger px-2 py-0.5 rounded-full">
                          Agotado
                        </span>
                      )}
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
