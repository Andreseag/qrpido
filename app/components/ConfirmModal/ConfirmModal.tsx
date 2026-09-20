"use client";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop con blur */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-in zoom-in-95 fade-in space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-2xl border shrink-0 ${
                isDanger
                  ? "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400"
                  : "bg-primary/10 border-primary/20 text-primary"
              }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-foreground">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-xl hover:bg-border/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 bg-background hover:bg-border text-foreground border border-border rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
            }`}>
            {loading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
