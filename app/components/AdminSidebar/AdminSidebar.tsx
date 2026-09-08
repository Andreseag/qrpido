"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  ChefHat,
  LogOut,
  Store,
  Users,
  MessageCircle,
  Bike,
  UserCheck,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { AppRole, useUserRole } from "@/app/hooks/useUserRole";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles: AppRole[];
}

// Diccionario profesional para traducir los roles de la BD a la interfaz
const roleTranslations: Record<string, string> = {
  owner: "Dueño",
  cashier: "Cajero",
  chef: "Chef",
  waiter: "Mesero/a",
  mesero: "Mesero",
  mesera: "Mesera",
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading } = useUserRole();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Consultar el nombre personalizado desde restaurant_members
      const { data: memberData, error } = await supabase
        .from("restaurant_members")
        .select("full_name")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!error && memberData && (memberData as any).full_name) {
        setUserName((memberData as any).full_name);
      } else {
        const email = session.user.email || "";
        const nameFromEmail = email.split("@")[0];
        setUserName(
          nameFromEmail
            ? nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)
            : "Colaborador",
        );
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Definición estricta de accesos por rol
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      roles: ["owner"],
    },
    {
      name: "Inventario / Menú",
      href: "/admin/inventory",
      icon: Package,
      roles: ["owner"],
    },
    {
      name: "Gestión de Mesas",
      href: "/admin/tables",
      icon: UtensilsCrossed,
      roles: ["owner", "cashier", "waiter", "mesero", "mesera"],
    },
    {
      name: "Cocina (KDS)",
      href: "/admin/kitchen",
      icon: ChefHat,
      roles: ["owner", "chef"],
    },
    {
      name: "Domicilios",
      href: "/admin/delivery",
      icon: Bike,
      roles: ["owner", "cashier"],
    },
    {
      name: "Clientes",
      href: "/admin/clientes",
      icon: Settings,
      roles: ["owner"],
    },
    {
      name: "Campañas WhatsApp",
      href: "/admin/campaigns",
      icon: MessageCircle,
      roles: ["owner"],
    },
    {
      name: "Configuración",
      href: "/admin/settings",
      icon: Store,
      roles: ["owner"],
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  const translatedRole = role ? roleTranslations[role] || role : "";

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen">
      <div>
        {/* Logo / Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-amber-500 p-2.5 rounded-2xl text-slate-950 font-black">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-tight">
              QRPido
            </h1>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              {loading ? "Cargando rol..." : `Rol: ${translatedRole}`}
            </p>
          </div>
        </div>

        {/* Info del Usuario Logueado (Perfil) */}
        <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/30 flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-xl text-slate-300">
            <UserCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Conectado como
            </p>
            <p
              className="text-sm font-bold text-white truncate"
              title={userName}>
              {userName || "Cargando..."}
            </p>
          </div>
        </div>

        {/* Links de Navegación Dinámicos */}
        <nav className="p-4 space-y-2">
          {loading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-11 bg-slate-800/40 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}>
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })
          )}
        </nav>
      </div>

      {/* Botón de Salir */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
