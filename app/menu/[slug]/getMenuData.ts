export interface MenuPalette {
  id: string;
  name: string;
  background: string;
  surface: string;
  border: string;
  foreground: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
}

export const MENU_PALETTES: MenuPalette[] = [
  {
    id: "amber_classic",
    name: "Ámbar Clásico",
    background: "#fffbeb",
    surface: "#ffffff",
    border: "#fde68a",
    foreground: "#451a03",
    mutedForeground: "#92400e",
    primary: "#f59e0b",
    primaryForeground: "#451a03",
  },
  {
    id: "emerald_fresh",
    name: "Esmeralda Fresco",
    background: "#f0fdf4",
    surface: "#ffffff",
    border: "#bbf7d0",
    foreground: "#052e16",
    mutedForeground: "#166534",
    primary: "#059669",
    primaryForeground: "#ffffff",
  },
  {
    id: "terracotta_warm",
    name: "Terracota Cálido",
    background: "#fff7ed",
    surface: "#ffffff",
    border: "#fed7aa",
    foreground: "#431407",
    mutedForeground: "#9a3412",
    primary: "#c2410c",
    primaryForeground: "#ffffff",
  },
  {
    id: "blue_modern",
    name: "Azul Moderno",
    background: "#eff6ff",
    surface: "#ffffff",
    border: "#bfdbfe",
    foreground: "#1e3a8a",
    mutedForeground: "#1d4ed8",
    primary: "#2563eb",
    primaryForeground: "#ffffff",
  },
  {
    id: "pink_bakery",
    name: "Rosa Pastelería",
    background: "#fdf2f8",
    surface: "#ffffff",
    border: "#fbcfe8",
    foreground: "#500724",
    mutedForeground: "#9d174d",
    primary: "#db2777",
    primaryForeground: "#ffffff",
  },
  {
    id: "elegant_night",
    name: "Elegante Nocturno",
    background: "#0a0a0a",
    surface: "#171717",
    border: "#292929",
    foreground: "#f5f5f5",
    mutedForeground: "#a3a3a3",
    primary: "#d4af37",
    primaryForeground: "#171717",
  },
  {
    id: "violet_contemporary",
    name: "Violeta Contemporáneo",
    background: "#faf5ff",
    surface: "#ffffff",
    border: "#e9d5ff",
    foreground: "#3b0764",
    mutedForeground: "#6d28d9",
    primary: "#7c3aed",
    primaryForeground: "#ffffff",
  },
  {
    id: "mint_minimal",
    name: "Menta Minimalista",
    background: "#f0fdfa",
    surface: "#ffffff",
    border: "#99f6e4",
    foreground: "#042f2e",
    mutedForeground: "#0f766e",
    primary: "#0d9488",
    primaryForeground: "#ffffff",
  },
];

export function getPalette(id: string): MenuPalette {
  return MENU_PALETTES.find((p) => p.id === id) || MENU_PALETTES[0];
}

export const MENU_TEMPLATES = ["classic", "grid", "elegant"] as const;
export type MenuTemplateId = (typeof MENU_TEMPLATES)[number];

export const MENU_TEMPLATE_LABELS: Record<
  MenuTemplateId,
  { name: string; description: string }
> = {
  classic: {
    name: "Clásico",
    description: "Lista compacta con foto pequeña, nombre y precio.",
  },
  grid: {
    name: "Visual (Grid)",
    description:
      "Cuadrícula de fotos grandes — ideal si tienes buenas fotos de tus platos.",
  },
  elegant: {
    name: "Elegante",
    description: "Minimalista, sin fotos, tipo carta de restaurante fino.",
  },
};
