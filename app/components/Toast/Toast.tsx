import { ToastState } from "@/app/admin/tables/types";
import { AlertCircle, CheckCircle2, Layers } from "lucide-react";

interface ToastProps {
  toast: ToastState | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[110] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs font-bold ${
          toast.type === "error"
            ? "bg-red-950/90 border-red-500/40 text-red-300 shadow-red-500/10"
            : toast.type === "success"
              ? "bg-slate-950/90 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10"
              : "bg-slate-950/90 border-amber-500/40 text-amber-300 shadow-amber-500/10"
        }`}>
        {toast.type === "error" ? (
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        ) : toast.type === "success" ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <Layers className="w-4 h-4 text-amber-400 shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
