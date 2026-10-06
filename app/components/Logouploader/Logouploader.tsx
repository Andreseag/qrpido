"use client";
import { ImageIcon } from "lucide-react";

interface LogoUploaderProps {
  logoUrl: string | null;
  uploading: boolean;
  onUpload: (file: File) => void;
}

export function LogoUploader({
  logoUrl,
  uploading,
  onUpload,
}: LogoUploaderProps) {
  return (
    <div className="bg-surface border border-border rounded-3xl p-6 space-y-4">
      <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
        Logo del Restaurante
      </h2>
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo actual"
            className="w-16 h-16 rounded-2xl object-cover border border-border shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center shrink-0">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <label className="flex-1 flex items-center justify-center gap-2 p-3.5 bg-background border border-dashed border-border rounded-2xl text-muted-foreground text-xs font-bold cursor-pointer hover:border-primary transition-colors">
          {uploading ? "Subiendo..." : logoUrl ? "Cambiar logo" : "Subir logo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Aparece en el header del menú público, en vez del ícono genérico.
      </p>
    </div>
  );
}
