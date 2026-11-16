"use client";

import { useState, useEffect } from "react";
import { Download, Smartphone, X, Sparkles, Monitor } from "lucide-react";

export function PwaInstallModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 1. Verificar si la app ya está instalada (modo standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    if (isStandalone) return; // Si ya está instalada, no mostramos nada

    // 2. Verificar si el usuario ya lo cerró en esta sesión para no ser castigadores
    const dismissed = sessionStorage.getItem("pwa_install_dismissed");
    if (dismissed) return;

    // 3. Capturar el evento de instalación del navegador
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Evitamos que el navegador lo muestre por defecto
      setDeferredPrompt(e);

      // Mostramos nuestro modal pro con un pequeño retraso de 1.5s al abrir/loguearse
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1500);

      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Disparar el prompt nativo del navegador
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("¡Usuario aceptó instalar la PWA de QRPido!");
    }

    // Limpiar el prompt y cerrar modal
    setDeferredPrompt(null);
    setShowModal(false);
  };

  const handleDismiss = () => {
    setShowModal(false);
    // Guardar en sessionStorage para que no vuelva a aparecer en la misma pestaña/sesión
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-background border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col p-6 space-y-6 text-foreground"
        onClick={(e) => e.stopPropagation()}>
        {/* Botón Cerrar */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 bg-surface hover:bg-surface/80 text-muted-foreground hover:text-foreground p-2 rounded-full transition-colors border border-border cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        {/* Ícono superior decorativo */}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Aplicación Oficial
            </span>
            <h3 className="text-lg font-black tracking-tight mt-1">
              ¡Lleva QRPido al siguiente nivel! 🚀
            </h3>
          </div>
        </div>

        {/* Mensaje principal estilo Alegra */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Instala la aplicación oficial de{" "}
          <strong className="text-foreground">QRPido</strong> en tu celular o
          computador para acceder más rápido, recibir notificaciones y trabajar
          sin distracciones del navegador.
        </p>

        {/* Beneficios visuales rápidos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface p-3 rounded-2xl border border-border flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[11px] font-bold">Modo Celular</span>
          </div>
          <div className="bg-surface p-3 rounded-2xl border border-border flex items-center gap-2.5">
            <Monitor className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[11px] font-bold">Escritorio Pro</span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 rounded-xl bg-surface hover:bg-surface/80 border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-center">
            Ahora no
          </button>

          <button
            onClick={handleInstallClick}
            className="flex-2 py-3 px-5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 cursor-pointer">
            <Download className="w-4 h-4" /> Instalar App
          </button>
        </div>
      </div>
    </div>
  );
}
