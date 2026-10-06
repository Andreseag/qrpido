import { notFound } from "next/navigation";
import { getPalette } from "@/app/lib/menu-palettes";
import { getMenuData } from "./hooks/Getmenudata";
import { buildSections } from "./buildSections";
import { GridMenuTemplate } from "./templates/Gridmenutemplate";
import { ElegantMenuTemplate } from "./templates/Elegantmenutemplate";
import { ClassicMenuTemplate } from "./templates/ClassicMenuTemplate";

// Cachea la página 5 minutos: el menú no cambia segundo a segundo.
export const revalidate = 300;

interface MenuPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: MenuPageProps) {
  const { slug } = await params;
  const menu = await getMenuData(slug);
  if (!menu) notFound();

  const palette = getPalette(menu.themePalette);
  const sections = buildSections(menu);

  // Estas variables CSS pisan (por especificidad de inline style) lo
  // que venga de :root/.dark en globals.css — el look de marca del
  // restaurante manda, sin importar el modo claro/oscuro del celular
  // del cliente. Como todos los componentes de las plantillas usan
  // las mismas clases bg-primary/text-foreground/etc. del resto del
  // sistema, no hubo que tocar ni una línea de ellas para que esto
  // funcione — solo cambia el valor detrás de la variable.
  const themeStyle = {
    "--background": palette.background,
    "--surface": palette.surface,
    "--border": palette.border,
    "--foreground": palette.foreground,
    "--muted-foreground": palette.mutedForeground,
    "--primary": palette.primary,
    "--primary-foreground": palette.primaryForeground,
  } as React.CSSProperties;

  const templateProps = {
    restaurantName: menu.restaurantName,
    logoUrl: menu.logoUrl,
    sections,
  };

  return (
    <div style={themeStyle}>
      {menu.menuTemplate === "grid" ? (
        <GridMenuTemplate {...templateProps} />
      ) : menu.menuTemplate === "elegant" ? (
        <ElegantMenuTemplate {...templateProps} />
      ) : (
        <ClassicMenuTemplate {...templateProps} />
      )}
    </div>
  );
}
