"use client";

import Image from "next/image";
import { Anton, Barlow_Semi_Condensed } from "next/font/google";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Store, UtensilsCrossed, X } from "lucide-react";
import { PublicMenuProduct } from "../types";
import { MenuTemplateProps } from "./types";

/* ============================================================
 * Plantilla "Urbano / Cartel"
 *
 * Adaptada del HTML interactivo (menu-interactivo.html):
 *  - Fondo fijo con parallax, hero a pantalla casi completa
 *  - Títulos de sección como cintas rotadas
 *  - Platos en zig-zag con sello de precio
 *  - Categorías sin fotos como "ticket" perforado
 *  - Modal de detalle con lista de ingredientes
 *
 * Todos los colores salen de los tokens (--primary, --background…)
 * que page.tsx inyecta según la paleta del restaurante, así que no
 * hay ningún color hardcodeado de la versión original.
 * ============================================================ */

// next/font self-hostea las fuentes (sin <link> a Google, sin saltos de layout)
const anton = Anton({ subsets: ["latin"], weight: "400", display: "swap" });
const barlow = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

// Locale explícito: sin él, el servidor y el navegador pueden formatear
// distinto ("26,000" vs "26.000") y React lanza error de hidratación.
const formatPrice = (value: number) =>
  `$${Number(value).toLocaleString("es-CO")}`;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** "Pan, carne, queso" → ["Pan", "Carne", "Queso"]. Menos de 2 ítems = no es lista. */
function parseIngredients(description: string | null): string[] {
  if (!description) return [];
  const parts = description
    .split(/[\n;,]+/)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  return parts.length >= 2 ? parts : [];
}

/* ---------------- Estilos propios (prefijo bt-) ---------------- */

const CSS = `
@media (prefers-reduced-motion: no-preference){ html{ scroll-behavior:smooth; } }

.bt-root{
  --bt-shadow: 10px 10px 0 rgba(0,0,0,.28);
  --bt-deep: color-mix(in srgb, var(--primary) 62%, black);
  --bt-soft: color-mix(in srgb, var(--primary) 55%, var(--foreground));
  -webkit-font-smoothing: antialiased;
}
.bt-root ::selection{ background:var(--primary); color:var(--primary-foreground); }

/* Fondo fijo */
.bt-fixed{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
.bt-grain{
  position:absolute; inset:-10%;
  background-image:radial-gradient(color-mix(in srgb, var(--foreground) 9%, transparent) 1px, transparent 1.4px);
  background-size:3px 3px; opacity:.5;
}
.bt-grid{
  position:absolute; inset:-20%;
  background-image:
    linear-gradient(color-mix(in srgb, var(--foreground) 10%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--foreground) 10%, transparent) 1px, transparent 1px);
  background-size:64px 64px; opacity:.55;
}
/* Sin filter:blur — el degradado radial ya es suave y el blur de 70px
   sobre capas gigantes en movimiento es muy pesado en celulares viejos. */
.bt-glow{ position:absolute; border-radius:9999px; will-change:transform; }
.bt-glow-a{ width:60vw; height:60vw; left:-15vw; top:-10vh;
  background:radial-gradient(circle at 30% 30%, var(--primary), transparent 70%); opacity:.30; }
.bt-glow-b{ width:50vw; height:50vw; right:-15vw; top:38vh;
  background:radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--primary) 50%, white), transparent 70%); opacity:.32; }
.bt-glow-c{ width:55vw; height:55vw; left:-8vw; bottom:-22vh;
  background:radial-gradient(circle at 50% 50%, var(--primary), transparent 70%); opacity:.22; }
.bt-vignette{ position:absolute; inset:0;
  background:radial-gradient(ellipse at center, transparent 45%, color-mix(in srgb, var(--background) 88%, black) 100%); }

/* Cintas, sellos y tipografía */
.bt-ribbon{
  display:inline-block; max-width:92vw;
  background:var(--foreground); color:var(--background);
  text-transform:uppercase; line-height:1;
  padding:.28em .7em .34em; transform:rotate(-3deg);
  box-shadow:var(--bt-shadow);
}
.bt-tilt-r{ transform:rotate(2.4deg); }
.bt-section-ribbon{ font-size:clamp(1.4rem, 5.2vw, 3.2rem); }

.bt-stamp{
  display:inline-flex; align-items:center; justify-content:center;
  background:var(--primary); color:var(--primary-foreground);
  border-radius:14px; padding:.32em .65em .4em; transform:rotate(-6deg);
  box-shadow:0 6px 0 var(--bt-deep), var(--bt-shadow);
  font-size:clamp(1.05rem, 3.6vw, 1.55rem); letter-spacing:.02em; line-height:1.1;
}
.bt-soldout{
  display:inline-block; font-size:.62rem; font-weight:800; letter-spacing:.08em;
  text-transform:uppercase; padding:.2em .7em; border-radius:9999px;
  background:color-mix(in srgb, var(--danger) 14%, transparent);
  color:var(--danger); border:1px solid color-mix(in srgb, var(--danger) 35%, transparent);
}

/* Hero */
.bt-logo{
  position:relative; width:84px; height:84px; border-radius:9999px; overflow:hidden;
  background:var(--primary); color:var(--primary-foreground);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 8px 0 var(--bt-deep), 0 18px 30px rgba(0,0,0,.3);
}
.bt-sizzle{ animation:bt-sizzle 4.5s ease-in-out infinite; }
@keyframes bt-sizzle{ 0%,100%{ transform:rotate(-4deg); } 50%{ transform:rotate(4deg); } }
.bt-h1{
  margin:0; font-size:clamp(3rem, 12vw, 7.5rem); color:var(--foreground);
  text-transform:uppercase; line-height:.92; text-shadow:6px 6px 0 rgba(0,0,0,.22);
}
.bt-hl{
  display:inline-block; background:var(--primary); color:var(--primary-foreground);
  padding:0 .18em; transform:rotate(-2deg); box-shadow:var(--bt-shadow); text-shadow:none;
}
.bt-eyebrow{ margin-top:26px; font-size:clamp(1.2rem, 3.4vw, 2.1rem); }
.bt-sub{
  margin-top:30px; max-width:36ch; font-size:clamp(1rem, 1.6vw, 1.2rem);
  color:var(--muted-foreground); font-weight:600; line-height:1.5;
}
.bt-cue{
  margin-top:48px; letter-spacing:.14em; font-size:.85rem; color:var(--bt-soft);
  display:flex; flex-direction:column; align-items:center; gap:10px; opacity:.9;
}
.bt-stick{ width:2px; height:36px; background:linear-gradient(currentColor, transparent); animation:bt-drip 1.8s ease-in-out infinite; }
@keyframes bt-drip{
  0%{ transform:scaleY(.4); transform-origin:top; opacity:.3; }
  50%{ transform:scaleY(1); transform-origin:top; opacity:1; }
  100%{ transform:scaleY(.4); transform-origin:top; opacity:.3; }
}
.bt-kicker{
  display:block; font-style:italic; font-weight:700; letter-spacing:.08em;
  color:var(--bt-soft); margin-bottom:14px; font-size:.95rem;
}

/* Nav de categorías */
.bt-nav-scroll{ scrollbar-width:none; }
.bt-nav-scroll::-webkit-scrollbar{ display:none; }
/* margin:auto en los extremos centra sin recortar cuando hay overflow */
.bt-nav-scroll::before, .bt-nav-scroll::after{ content:""; margin:auto; }

/* Platos */
.bt-dish:focus-visible{ outline:3px solid var(--primary); outline-offset:6px; border-radius:20px; }
.bt-name{ font-size:clamp(1.3rem, 5vw, 3rem); text-transform:uppercase; line-height:.95; margin:0 0 12px; }
.bt-desc{
  font-size:clamp(.88rem, 2.4vw, 1.02rem); color:var(--muted-foreground); font-weight:500;
  max-width:32ch; margin:0 0 16px; line-height:1.4;
  display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
}
.bt-sticker{
  box-shadow:8px 8px 0 rgba(0,0,0,.26);
  transition:transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .45s ease;
  will-change:transform;
}
.bt-rot-l{ transform:rotate(-2deg); }
.bt-rot-r{ transform:rotate(2deg); }
.bt-dish:hover .bt-rot-l{ transform:translateY(-8px) rotate(-3.5deg) scale(1.03); box-shadow:12px 16px 0 rgba(0,0,0,.26); }
.bt-dish:hover .bt-rot-r{ transform:translateY(-8px) rotate(3.5deg) scale(1.03); box-shadow:12px 16px 0 rgba(0,0,0,.26); }
.bt-tap{
  position:absolute; bottom:6%; left:50%; transform:translateX(-50%) rotate(-4deg);
  background:var(--foreground); color:var(--background);
  font-size:.7rem; letter-spacing:.08em; padding:6px 12px; border-radius:20px;
  opacity:0; transition:opacity .3s ease, transform .3s ease; white-space:nowrap; pointer-events:none;
}
.bt-dish:hover .bt-tap{ opacity:1; transform:translateX(-50%) rotate(-4deg) translateY(-6px); }
@media (hover:none){ .bt-tap{ display:none; } }

/* Ticket (categorías sin fotos) */
.bt-ticket{
  position:relative; background:var(--surface); color:var(--foreground);
  padding:34px 26px 24px; max-width:460px; width:100%;
  transform:rotate(1.2deg); box-shadow:0 20px 40px rgba(0,0,0,.28);
  border:1px solid var(--border);
}
.bt-ticket::before, .bt-ticket::after{
  content:""; position:absolute; left:0; right:0; height:14px;
  background:radial-gradient(circle, var(--background) 6px, transparent 7px) 0 0/20px 20px repeat-x;
}
.bt-ticket::before{ top:-7px; }
.bt-ticket::after{ bottom:-7px; transform:rotate(180deg); }
.bt-ticket li{
  display:flex; justify-content:space-between; align-items:flex-start; gap:16px;
  padding:9px 0; border-bottom:1px dashed var(--border); font-weight:700; font-size:1.02rem;
}
.bt-ticket li:last-child{ border-bottom:0; }
.bt-ticket-desc{ display:block; font-weight:500; font-size:.82rem; color:var(--muted-foreground); font-style:italic; margin-top:2px; }
.bt-ticket-price{ color:var(--bt-deep); white-space:nowrap; font-size:1.1rem; letter-spacing:.02em; }

/* Footer */
.bt-footer-banner{
  display:inline-block; background:var(--primary); color:var(--primary-foreground);
  padding:16px 26px; font-size:clamp(1rem, 2.6vw, 1.5rem); text-transform:uppercase;
  box-shadow:var(--bt-shadow); transform:rotate(-1.4deg); max-width:90vw;
}

/* Reveal al hacer scroll */
.bt-reveal{ opacity:0; transform:translateY(34px); transition:opacity .7s ease, transform .7s cubic-bezier(.2,.8,.2,1); }
.bt-reveal.bt-in{ opacity:1; transform:none; }

/* Modal */
.bt-modal{
  transform:scale(.92) rotate(-1deg); transition:transform .35s cubic-bezier(.2,.8,.2,1);
  box-shadow:0 30px 60px rgba(0,0,0,.5);
}
.bt-overlay[data-open="true"] .bt-modal{ transform:scale(1) rotate(0deg); }
.bt-close{ transition:transform .25s ease; }
.bt-close:hover{ transform:rotate(90deg); }
.bt-ing li{ display:flex; align-items:baseline; gap:10px; font-weight:600; font-size:1.02rem; }
.bt-ing li::before{
  content:""; width:8px; height:8px; border-radius:9999px; background:var(--primary);
  flex:none; transform:translateY(-2px);
}

@media (prefers-reduced-motion: reduce){
  .bt-root *{ animation:none !important; transition:none !important; }
  .bt-reveal{ opacity:1; transform:none; }
}
`;

/* ---------------- Piezas pequeñas ---------------- */

/** Aparece (fade + subida) cuando entra al viewport. */
function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`bt-reveal ${visible ? "bt-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

function LogoStamp({
  logoUrl,
  name,
  animated,
}: {
  logoUrl: string | null;
  name: string;
  animated?: boolean;
}) {
  return (
    <div className={`bt-logo ${animated ? "bt-sizzle" : ""}`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          fill
          sizes="84px"
          className="object-cover"
        />
      ) : (
        <Store className="h-10 w-10" aria-hidden />
      )}
    </div>
  );
}

function DishFigure({
  product,
  tilt,
  sizes,
}: {
  product: PublicMenuProduct;
  tilt: "l" | "r";
  sizes: string;
}) {
  return (
    <div
      className={`bt-sticker ${tilt === "l" ? "bt-rot-l" : "bt-rot-r"} relative aspect-square w-full max-w-[440px] overflow-hidden rounded-[24px] border-2 border-foreground bg-surface sm:border-[3px]`}>
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/10">
          <UtensilsCrossed
            className="h-1/3 w-1/3 text-primary/50"
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}

function DishRow({
  product,
  index,
  onOpen,
}: {
  product: PublicMenuProduct;
  index: number;
  onOpen: (p: PublicMenuProduct) => void;
}) {
  const reverse = index % 2 === 1;
  const open = () => onOpen(product);

  return (
    <Reveal className={index > 0 ? "border-t border-dashed border-border" : ""}>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        className={`bt-dish group grid cursor-pointer items-center gap-4 py-7 sm:grid-cols-2 sm:gap-10 sm:py-16 ${
          reverse ? "grid-cols-[1fr_42%]" : "grid-cols-[42%_1fr]"
        } ${!product.stock ? "opacity-60" : ""}`}>
        <div
          className={`relative flex items-center justify-center ${reverse ? "order-2" : ""}`}>
          <DishFigure
            product={product}
            tilt={reverse ? "r" : "l"}
            sizes="(max-width: 640px) 42vw, 440px"
          />
          <span className={`bt-tap ${anton.className}`}>
            Toca para ver detalles
          </span>
        </div>

        <div
          className={`flex min-w-0 flex-col ${
            reverse ? "order-1 items-end text-right" : "items-start"
          }`}>
          <h3 className={`${anton.className} bt-name`}>{product.name}</h3>
          {product.description && (
            <p className={`bt-desc ${reverse ? "ml-auto" : ""}`}>
              {product.description}
            </p>
          )}
          <div
            className={`flex flex-wrap items-center gap-2 ${reverse ? "justify-end" : ""}`}>
            <span className={`${anton.className} bt-stamp`}>
              {formatPrice(product.price)}
            </span>
            {!product.stock && <span className="bt-soldout">Agotado</span>}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function TicketList({ products }: { products: PublicMenuProduct[] }) {
  return (
    <Reveal className="flex justify-center py-4">
      <div className="bt-ticket">
        <ul className="m-0 list-none p-0">
          {products.map((p) => (
            <li key={p.id} className={!p.stock ? "opacity-60" : ""}>
              <div className="min-w-0">
                <span className="block">{p.name}</span>
                {p.description && (
                  <span className="bt-ticket-desc">{p.description}</span>
                )}
                {!p.stock && <span className="bt-soldout mt-1">Agotado</span>}
              </div>
              <span className={`${anton.className} bt-ticket-price`}>
                {formatPrice(p.price)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/* ---------------- Plantilla ---------------- */

export function BoldMenuTemplate({
  restaurantName,
  logoUrl,
  sections,
}: MenuTemplateProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );
  const [selected, setSelected] = useState<PublicMenuProduct | null>(null);
  const [open, setOpen] = useState(false);

  /* Parallax acotado: los glows oscilan suavemente según el scroll y
     nunca se salen de pantalla, aunque el menú sea larguísimo. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const layers = Array.from(
      root.querySelectorAll<HTMLElement>("[data-speed]"),
    );
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      layers.forEach((el, i) => {
        const speed = parseFloat(el.dataset.speed || "0");
        const ty = Math.sin(y * speed * 0.006 + i) * 16;
        const tx = Math.cos(y * speed * 0.004 + i) * 5;
        el.style.transform = `translate3d(${tx}vw, ${ty}vh, 0)`;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll-spy: resalta en el nav la categoría que se está leyendo */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = sections
      .map((s) => document.getElementById(`cat-${s.id}`))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id.replace("cat-", ""));
        });
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  /* Mantiene visible la pastilla activa dentro del nav horizontal */
  useEffect(() => {
    if (!activeId) return;
    const pill = navRef.current?.querySelector<HTMLElement>(
      `[data-pill="${activeId}"]`,
    );
    pill?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeId]);

  /* Modal */
  const openDish = (product: PublicMenuProduct) => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setSelected(product);
    setOpen(true);
  };

  const closeDish = useCallback(() => {
    setOpen(false);
    lastFocused.current?.focus?.();
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => closeBtnRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDish();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeDish]);

  // Mantiene el foco dentro del modal mientras está abierto
  const trapTab = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const focusables =
      modalRef.current?.querySelectorAll<HTMLElement>("button, [href]");
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const ingredients = useMemo(
    () => parseIngredients(selected?.description ?? null),
    [selected],
  );

  return (
    <div
      ref={rootRef}
      // overflow-x-clip (NO hidden): hidden convertiría este div en un
      // contenedor de scroll y rompería el position:sticky del nav.
      className={`bt-root ${barlow.className} relative min-h-screen overflow-x-clip bg-background text-foreground`}>
      <style>{CSS}</style>

      {/* Fondo fijo con parallax */}
      <div className="bt-fixed" aria-hidden="true">
        <div className="bt-glow bt-glow-a" data-speed="0.9" />
        <div className="bt-glow bt-glow-b" data-speed="1.4" />
        <div className="bt-glow bt-glow-c" data-speed="0.6" />
        <div className="bt-grid" />
        <div className="bt-grain" />
        <div className="bt-vignette" />
      </div>

      <div className="relative z-[2]">
        {/* Hero */}
        <header className="flex min-h-[88svh] flex-col items-center justify-center px-5 pb-14 pt-20 text-center">
          <div className="mb-7">
            <LogoStamp logoUrl={logoUrl} name={restaurantName} animated />
          </div>
          <h1 className={`${anton.className} bt-h1`}>
            Nuestro
            <br />
            <span className="bt-hl">Menú</span>
          </h1>
          <div className={`${anton.className} bt-ribbon bt-eyebrow`}>
            {restaurantName}
          </div>
          <p className="bt-sub">
            Toca cualquier plato para ver sus detalles e ingredientes.
          </p>
          <div className={`${anton.className} bt-cue`}>
            <span className="bt-stick" />
            DESLIZA
          </div>
        </header>

        {/* Nav de categorías */}
        {sections.length > 1 && (
          <nav className="sticky top-0 z-30 border-y border-border bg-background/90 backdrop-blur-md">
            <div
              ref={navRef}
              className="bt-nav-scroll mx-auto flex max-w-[1080px] gap-2 overflow-x-auto px-5 py-3">
              {sections.map((section) => {
                const isActive = section.id === activeId;
                return (
                  <a
                    key={section.id}
                    href={`#cat-${section.id}`}
                    data-pill={section.id}
                    className={`${anton.className} shrink-0 rounded-full border px-4 py-2 text-[0.78rem] uppercase tracking-[0.08em] transition-colors ${
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}>
                    {section.name}
                  </a>
                );
              })}
            </div>
          </nav>
        )}

        {/* Secciones */}
        <main className="mx-auto max-w-[1080px] px-5 pb-8 sm:px-10">
          {sections.length === 0 ? (
            <div className="py-24 text-center">
              <UtensilsCrossed className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Este restaurante aún no ha publicado su menú.
              </p>
            </div>
          ) : (
            sections.map((section, sIdx) => {
              // Sin ninguna foto → se muestra como ticket (adicionales, bebidas…)
              const asTicket = section.products.every((p) => !p.image_url);
              const count = section.products.length;
              return (
                <section
                  key={section.id}
                  id={`cat-${section.id}`}
                  className="scroll-mt-20 pb-6 pt-14">
                  <Reveal className="mb-8 text-center sm:mb-14">
                    <span className="bt-kicker">
                      {count} {count === 1 ? "opción" : "opciones"}
                    </span>
                    <div
                      className={`${anton.className} bt-ribbon bt-section-ribbon ${
                        sIdx % 2 === 1 ? "bt-tilt-r" : ""
                      }`}>
                      {section.name}
                    </div>
                  </Reveal>

                  {asTicket ? (
                    <TicketList products={section.products} />
                  ) : (
                    section.products.map((product, idx) => (
                      <DishRow
                        key={product.id}
                        product={product}
                        index={idx}
                        onOpen={openDish}
                      />
                    ))
                  )}
                </section>
              );
            })
          )}
        </main>

        {/* Footer */}
        <footer className="px-5 pb-24 pt-14 text-center">
          <Reveal>
            <div className={`${anton.className} bt-footer-banner`}>
              ¡Buen provecho!
            </div>
          </Reveal>
          <Reveal className="mx-auto mt-10 w-fit">
            <LogoStamp logoUrl={logoUrl} name={restaurantName} />
          </Reveal>
          <p className="mt-4 text-[0.8rem] text-muted-foreground opacity-70">
            Menú digital generado con QRPido
          </p>
        </footer>
      </div>

      {/* Modal de detalle */}
      <div
        className={`bt-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-[opacity,visibility] duration-300 ${
          open
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
        data-open={open}
        aria-hidden={!open}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeDish();
        }}>
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bt-modal-title"
          onKeyDown={trapTab}
          className="bt-modal relative max-h-[88vh] w-full max-w-[720px] overflow-auto rounded-[20px] bg-surface p-6 text-foreground sm:p-10">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeDish}
            aria-label="Cerrar"
            className="bt-close absolute right-3.5 top-3.5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-foreground text-background">
            <X className="h-5 w-5" />
          </button>

          {selected && (
            <>
              <div className="grid items-center gap-6 text-center sm:grid-cols-[1fr_1.15fr] sm:text-left">
                <div className="mx-auto w-full max-w-[260px]">
                  <DishFigure product={selected} tilt="l" sizes="260px" />
                </div>
                <div className="flex flex-col items-center gap-3 sm:items-start">
                  <h2
                    id="bt-modal-title"
                    className={`${anton.className} text-[clamp(1.7rem,4vw,2.4rem)] uppercase leading-[0.95]`}>
                    {selected.name}
                  </h2>
                  <span className={`${anton.className} bt-stamp`}>
                    {formatPrice(selected.price)}
                  </span>
                  {ingredients.length === 0 && selected.description && (
                    <p className="mt-1 text-[1.02rem] font-medium leading-relaxed text-muted-foreground">
                      {selected.description}
                    </p>
                  )}
                  {!selected.stock && (
                    <span className="bt-soldout">Agotado temporalmente</span>
                  )}
                </div>
              </div>

              {ingredients.length > 0 && (
                <div className="mt-7 border-t-2 border-foreground pt-5">
                  <div
                    className={`${anton.className} bt-ribbon mb-4 text-[1.05rem]`}>
                    Ingredientes
                  </div>
                  <ul className="bt-ing m-0 grid list-none gap-2.5 p-0">
                    {ingredients.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={closeDish}
                className="mt-7 w-full cursor-pointer rounded-xl bg-primary px-6 py-3 text-sm font-bold tracking-wide text-primary-foreground transition-opacity hover:opacity-90 sm:hidden">
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
