"use client";

import { RefreshCw } from "lucide-react";

interface LoadingStateProps {
  message?: string; // Texto personalizable opcional
  fullHeight?: boolean; // Por si quieres que ocupe toda la pantalla o solo un contenedor
}

export function LoadingState({
  message = "Cargando datos...",
  fullHeight = true,
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullHeight ? "min-h-[60vh]" : "py-16"
      }`}>
      <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
