import { ConfirmDialogState } from "@/app/admin/tables/types";
import { AlertCircle, HelpCircle } from "lucide-react";

interface ConfirmDialogProps {
  dialog: ConfirmDialogState | null;
  onCancel: () => void;
}

export function ConfirmDialog({ dialog, onCancel }: ConfirmDialogProps) {
  if (!dialog || !dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl border ${
              dialog.type === "danger"
                ? "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400"
            }`}>
            {dialog.type === "danger" ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <HelpCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-foreground font-black text-base">
              {dialog.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {dialog.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-border hover:bg-border text-foreground font-bold text-xs transition-colors cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={dialog.onConfirm}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
              dialog.type === "danger"
                ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
            }`}>
            {dialog.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
