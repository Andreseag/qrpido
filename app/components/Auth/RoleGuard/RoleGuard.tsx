"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppRole, useUserRole } from "@/app/hooks/useUserRole";

interface RoleGuardProps {
  allowedRoles: AppRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!role) {
        // Si no tiene rol o no está logueado, al login
        router.push("/login");
      } else if (!allowedRoles.includes(role)) {
        // Si tiene rol pero no está permitido en esta sección, lo redirigimos a su zona correspondiente
        if (role === "chef") router.push("admin/kitchen");
        else if (role === "cashier") router.push("admin/tables");
        else if (role === "waiter" || role === "mesero" || role === "mesera")
          router.push("admin/tables");
        else if (role === "owner") router.push("admin/");
        else router.push("admin/");
      }
    }
  }, [role, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-amber-400 font-black tracking-widest uppercase text-xs">
          Verificando credenciales y permisos...
        </p>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return null; // Evita un "flash" de contenido prohibido mientras redirige
  }

  return <>{children}</>;
}
