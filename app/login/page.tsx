"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Lock, Mail, Loader2 } from "lucide-react"; // Iconos pro
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
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_var(--qrpido-blue-soft),_transparent_40%),_radial-gradient(circle_at_bottom_right,_var(--qrpido-blue-soft),_transparent_40%)] bg-background p-4">
      {/* Tarjeta de Login con Efecto Glassmorphism */}
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-800">
        {/* Logo y Encabezado */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-qrpido-blue rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <LayoutDashboard className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            QRPido <span className="text-qrpido-blue">Admin</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            Gestiona tu restaurante en tiempo real
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Campo Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Email Corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                required
                type="email"
                placeholder="nombre@restaurante.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-qrpido-blue outline-none transition-all text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Campo Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-qrpido-blue outline-none transition-all text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Botón de Acción */}
          <button
            disabled={loading}
            className="w-full btn-primary mt-4 py-4 text-lg disabled:opacity-50">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-slate-400 font-medium">
          ¿Problemas con el acceso?{" "}
          <span className="text-qrpido-blue cursor-pointer hover:underline">
            Contactar soporte
          </span>
        </p>
      </div>
    </div>
  );
}
