"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Lock, Mail, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 80% at 50% -20%, color-mix(in srgb, var(--primary) 15%, transparent), rgba(255,255,255,0))",
      }}>
      {/* Tarjeta de Login con diseño profesional dark/amber */}
      <div className="w-full max-w-md bg-surface/60 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-border/80">
        {/* Logo y Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl mb-4 shadow-lg shadow-primary/10">
            <LayoutDashboard className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            QRPido <span className="text-primary">Admin</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-xs font-bold uppercase tracking-wider">
            Gestiona tu restaurante en tiempo real
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Campo Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Email Corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                required
                type="email"
                placeholder="nombre@restaurante.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-background/80 border border-border/80 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs text-foreground font-medium placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Campo Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-background/80 border border-border/80 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs text-foreground font-medium placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Botón de Acción */}
          <button
            disabled={loading}
            type="submit"
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-[11px] text-muted-foreground font-medium">
          ¿Problemas con el acceso?{" "}
          <span className="text-primary cursor-pointer hover:underline font-bold">
            Contactar soporte
          </span>
        </p>
      </div>
    </div>
  );
}
