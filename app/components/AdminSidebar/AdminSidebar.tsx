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
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { AppRole, useUserRole } from "@/app/hooks/useUserRole";
import RestaurantSwitcher from "../RestaurantSwitcher/RestaurantSwitcher";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      setUserId(session.user.id);

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
      name: "Gastos e Insumos",
      href: "/admin/expenses",
      icon: Wallet,
      roles: ["owner"],
    },
    {
      name: "Clientes",
      href: "/admin/clientes",
      icon: Users,
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
      icon: Settings,
      roles: ["owner"],
    },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  const translatedRole = role ? roleTranslations[role] || role : "";

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col justify-between hidden md:flex shrink-0 min-h-screen">
      <div>
        {/* Logo / Header */}
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="bg-primary p-2.5 rounded-2xl text-primary-foreground font-black">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-lg text-foreground tracking-tight">
              QRPido
            </h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {loading ? "Cargando rol..." : `Rol: ${translatedRole}`}
            </p>
          </div>
        </div>

        {/* Selector de Restaurante (solo aparece si administra más de uno) */}
        <RestaurantSwitcher userId={userId} />

        {/* Info del Usuario Logueado (Perfil) */}
        <div className="px-6 py-4 border-b border-border/60 bg-background/30 flex items-center gap-3">
          <div className="bg-border p-2 rounded-xl text-muted-foreground">
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Conectado como
            </p>
            <p
              className="text-sm font-bold text-foreground truncate"
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
                  className="h-11 bg-border/40 rounded-2xl animate-pulse"
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
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-border/60"
                  }`}>
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })
          )}
        </nav>
      </div>

      {/* Apariencia */}
      <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Apariencia
        </span>
        <ThemeToggle />
      </div>

      {/* Botón de Salir */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-danger hover:bg-danger/10 transition-all cursor-pointer">
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
