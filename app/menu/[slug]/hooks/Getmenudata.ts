import { supabaseAdmin } from "@/app/lib/supabase-admin";
import {
  PublicMenuCategory,
  PublicMenuData,
  PublicMenuProduct,
} from "../types";

export async function getMenuData(
  slug: string,
): Promise<PublicMenuData | null> {
  const { data: restaurant, error: restaurantError } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, menu_is_public")
    .eq("slug", slug)
    .maybeSingle();

  if (restaurantError || !restaurant || !restaurant.menu_is_public) {
    return null;
  }

  const [{ data: categoriesData }, { data: productsData }] = await Promise.all([
    supabaseAdmin
      .from("menu_categories")
      .select("id, name, display_order")
      .eq("restaurant_id", restaurant.id)
      .order("display_order", { ascending: true }),
    // IMPORTANTE: selección explícita de columnas — nunca select("*"),
    // porque products también tiene `cost` (costo de producción), que
    // jamás debe llegar a una página pública.
    supabaseAdmin
      .from("products")
      .select(
        "id, name, price, description, image_url, stock, category_id, display_order",
      )
      .eq("restaurant_id", restaurant.id)
      .order("display_order", { ascending: true }),
  ]);

  const products = (productsData || []) as PublicMenuProduct[];

  const categories: PublicMenuCategory[] = (categoriesData || []).map(
    (cat) => ({
      ...cat,
      products: products.filter((p) => p.category_id === cat.id),
    }),
  );

  const uncategorized = products.filter((p) => !p.category_id);

  return {
    restaurantName: restaurant.name,
    categories,
    uncategorized,
  };
}
