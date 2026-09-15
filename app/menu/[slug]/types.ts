export interface PublicMenuProduct {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  stock: boolean;
  category_id: string | null;
  display_order: number;
}

export interface PublicMenuCategory {
  id: string;
  name: string;
  display_order: number;
  products: PublicMenuProduct[];
}

export interface PublicMenuData {
  restaurantName: string;
  categories: PublicMenuCategory[];
  uncategorized: PublicMenuProduct[];
}
