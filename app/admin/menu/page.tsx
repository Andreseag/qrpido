"use client";
import { useState, useEffect } from "react";
import { QrCode, Eye, EyeOff, Check } from "lucide-react";
import { useMenuDigital } from "./hooks/Usemenudigital";
import RestaurantSelector from "@/app/components/Restaurantselector/Restaurantselector";
import { CategoryManager } from "@/app/components/Categorymanager/Categorymanager";
import { QrCodeGenerator } from "@/app/components/Qrcodegenerator/Qrcodegenerator";

export default function MenuDigitalPage() {
  const {
    loading,
    restaurants,
    needsSelection,
    selectRestaurant,
    slug,
    isMenuPublic,
    saving,
    saveSlug,
    toggleMenuPublic,
    categories,
    createCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
  } = useMenuDigital();

  const [slugInput, setSlugInput] = useState(slug);
  const [origin, setOrigin] = useState("");

  useEffect(() => setSlugInput(slug), [slug]);
  useEffect(() => setOrigin(window.location.origin), []);

  const menuUrl = `${origin}/menu/${slug}`;

  if (needsSelection) {
    return (
      <RestaurantSelector
        restaurants={restaurants}
        onSelect={selectRestaurant}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10">
      {/* Header Adaptativo */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="bg-primary/10 p-2.5 sm:p-3 rounded-2xl border border-primary/20 shrink-0">
            <QrCode className="text-primary w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Menú Digital
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Configura tu menú público y descarga el QR para tus mesas
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-primary font-black tracking-widest uppercase text-xs">
            Cargando configuración...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* URL pública / slug */}
            <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                Dirección del Menú
              </h2>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                  URL personalizada
                </label>

                {/* Contenedor Adaptativo de la URL (Móvil: Columna / Desktop: Fila) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-background border border-border p-2 rounded-2xl focus-within:border-primary transition">
                  <span className="text-xs text-muted-foreground font-mono px-2 py-1 bg-surface/80 rounded-xl truncate">
                    {origin}/menu/
                  </span>

                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={slugInput}
                      onChange={(e) => setSlugInput(e.target.value)}
                      className="w-full bg-transparent text-foreground text-xs font-bold outline-none px-1"
                      placeholder="tu-restaurante"
                    />
                    <button
                      onClick={() => saveSlug(slugInput)}
                      disabled={saving || slugInput === slug}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground p-2.5 rounded-xl transition shrink-0 cursor-pointer active:scale-95">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                  Si cambias esto después de imprimir el QR, el código impreso
                  dejará de funcionar — solo cámbialo si es necesario.
                </p>
              </div>

              <div className="flex items-center justify-between bg-background border border-border rounded-2xl p-3.5">
                <div className="flex items-center gap-2.5">
                  {isMenuPublic ? (
                    <Eye className="w-4 h-4 text-success shrink-0" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs font-bold text-foreground">
                    Menú {isMenuPublic ? "visible al público" : "oculto"}
                  </span>
                </div>
                <button
                  onClick={() => toggleMenuPublic(!isMenuPublic)}
                  role="switch"
                  aria-checked={isMenuPublic}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                    isMenuPublic ? "bg-primary" : "bg-border"
                  }`}>
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface transition-transform ${
                      isMenuPublic ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <CategoryManager
              categories={categories}
              onCreate={createCategory}
              onRename={renameCategory}
              onDelete={deleteCategory}
              onMove={moveCategory}
            />
          </div>

          <div className="w-full">
            {origin && <QrCodeGenerator menuUrl={menuUrl} />}
          </div>
        </div>
      )}
    </div>
  );
}
