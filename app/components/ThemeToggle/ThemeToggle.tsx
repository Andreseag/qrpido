"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes solo conoce el tema real después de montar en el cliente
  // (en el servidor no hay forma de saber la preferencia del sistema).
  // Sin este guard, el ícono podría parpadear o no coincidir en el
  // primer render — mejor mostrar un placeholder neutro hasta montar.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-11 h-6 rounded-full bg-surface-muted border border-border animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-11 h-6 rounded-full bg-surface-muted border border-border transition-colors cursor-pointer">
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center transition-transform duration-200 ${
          isDark ? "translate-x-5" : "translate-x-0"
        }`}>
        {isDark ? (
          <Moon className="w-3 h-3 text-primary-foreground" />
        ) : (
          <Sun className="w-3 h-3 text-primary-foreground" />
        )}
      </span>
    </button>
  );
}
