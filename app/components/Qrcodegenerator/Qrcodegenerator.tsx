"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink, Globe } from "lucide-react";

interface QrCodeGeneratorProps {
  menuUrl: string;
}

export function QrCodeGenerator({ menuUrl }: QrCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgString, setSvgString] = useState<string>("");

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, menuUrl, {
        width: 320,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
    }
    QRCode.toString(menuUrl, { type: "svg", margin: 2 }).then(setSvgString);
  }, [menuUrl]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "menu-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "menu-qr.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col items-center gap-4">
      {/* Fondo blanco fijo — un QR necesita alto contraste siempre,
          independiente de si el admin está en modo oscuro o claro */}
      <div className="bg-white p-4 rounded-2xl">
        <canvas ref={canvasRef} />
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground font-medium mb-1">
          Este QR lleva directo a:
        </p>
        <a
          href={menuUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-primary hover:underline break-all flex items-center gap-1 justify-center">
          <Globe className="w-3 h-3 shrink-0" /> {menuUrl}
        </a>
      </div>

      <div className="flex gap-2 w-full">
        <button
          onClick={downloadPng}
          className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider py-3 rounded-xl cursor-pointer transition-all">
          <Download className="w-3.5 h-3.5" /> PNG
        </button>
        <button
          onClick={downloadSvg}
          className="flex-1 flex items-center justify-center gap-2 bg-background hover:bg-border/60 text-foreground border border-border font-black text-xs uppercase tracking-wider py-3 rounded-xl cursor-pointer transition-all">
          <Download className="w-3.5 h-3.5" /> SVG
        </button>
      </div>

      <a
        href={menuUrl}
        target="_blank"
        rel="noreferrer"
        className="text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ExternalLink className="w-3 h-3" /> Ver menú público
      </a>
    </div>
  );
}
