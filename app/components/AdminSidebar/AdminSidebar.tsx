"use client";
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
  Wallet,
  QrCode,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { AppRole, useUserRole } from "@/app/hooks/useUserRole";
import RestaurantSwitcher from "../RestaurantSwitcher/RestaurantSwitcher";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { useActiveRestaurant } from "@/app/hooks/Useactiverestaurant";
import Link from "next/link";

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
  const { activeRestaurant } = useActiveRestaurant();
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!activeRestaurant) return;

    const fetchUserProfile = async () => {
      setUserLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUserLoading(false);
        return;
      }

      setUserId(session.user.id);

      const { data: memberData, error } = await supabase
        .from("restaurant_members")
        .select("full_name")
        .eq("user_id", session.user.id)
        .eq("restaurant_id", activeRestaurant.id)
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
      setUserLoading(false);
    };

    fetchUserProfile();
  }, [activeRestaurant]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
      name: "Menú Digital",
      href: "/admin/menu",
      icon: QrCode,
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

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="p-6 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className="bg-primary p-2.5 rounded-2xl text-primary-foreground font-black shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div className="overflow-hidden flex-1">
              {loading ? (
                <div className="space-y-1.5 py-0.5">
                  <div className="h-4 w-28 bg-border/60 rounded-md animate-pulse"></div>
                  <div className="h-2.5 w-16 bg-border/60 rounded-md animate-pulse"></div>
                </div>
              ) : (
                <>
                  <h1 className="font-black text-lg text-foreground tracking-tight truncate">
                    {activeRestaurant?.name || "QRPido"}
                  </h1>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">
                    Rol: {translatedRole}
                  </p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-border/60 transition-colors">
            <X size={20} />
          </button>
        </div>

        <RestaurantSwitcher userId={userId} />

        <div className="px-6 py-4 border-b border-border/60 bg-background/30 flex items-center gap-3">
          <div className="bg-border p-2 rounded-xl text-muted-foreground shrink-0">
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="overflow-hidden flex-1">
            {userLoading ? (
              <div className="space-y-1.5 py-0.5">
                <div className="h-2.5 w-20 bg-border/60 rounded-md animate-pulse"></div>
                <div className="h-3.5 w-28 bg-border/60 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Conectado como
                </p>
                <p
                  className="text-sm font-bold text-foreground truncate"
                  title={userName}>
                  {userName}
                </p>
              </>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
          {loading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-border/60"
                  }`}>
                  <Icon size={20} className="shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })
          )}
        </nav>
      </div>

      <div>
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Apariencia
          </span>
          <ThemeToggle />
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-danger hover:bg-danger/10 transition-all cursor-pointer">
            <LogOut size={20} className="shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 bg-surface border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground font-black shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="overflow-hidden flex-1">
            {loading ? (
              <div className="space-y-1 py-0.5">
                <div className="h-3.5 w-24 bg-border/60 rounded-md animate-pulse"></div>
                <div className="h-2 w-14 bg-border/60 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                <h1 className="font-black text-sm text-foreground tracking-tight truncate">
                  {activeRestaurant?.name || "QRPido"}
                </h1>
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest truncate">
                  {translatedRole}
                </p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 rounded-xl bg-border/40 text-foreground hover:bg-border/80 transition-colors shrink-0"
          aria-label="Abrir menú de navegación">
          <Menu size={22} />
        </button>
      </div>

      {/* Fondo oscuro translúcido con transición de opacidad real */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-all duration-300 ease-out ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Panel deslizante (Drawer) para móviles con curva de aceleración profesional */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border flex flex-col justify-between md:hidden shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <SidebarContent />
      </aside>

      <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col justify-between shrink-0 min-h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
