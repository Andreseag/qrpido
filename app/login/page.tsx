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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.15),rgba(255,255,255,0))] p-4">
      {/* Tarjeta de Login con diseño profesional dark/amber */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-slate-800/80">
        {/* Logo y Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4 shadow-lg shadow-amber-500/10">
            <LayoutDashboard className="text-amber-400 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            QRPido <span className="text-amber-400">Admin</span>
          </h1>
          <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-wider">
            Gestiona tu restaurante en tiempo real
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Campo Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Email Corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                required
                type="email"
                placeholder="nombre@restaurante.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-xs text-white font-medium placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Campo Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-xs text-white font-medium placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Botón de Acción */}
          <button
            disabled={loading}
            type="submit"
            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-[11px] text-slate-500 font-medium">
          ¿Problemas con el acceso?{" "}
          <span className="text-amber-400 cursor-pointer hover:underline font-bold">
            Contactar soporte
          </span>
        </p>
      </div>
    </div>
  );
}
