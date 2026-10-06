import { PublicMenuData, PublicMenuCategory } from "./types";

export function buildSections(menu: PublicMenuData): PublicMenuCategory[] {
  const sections: PublicMenuCategory[] = [
    ...menu.categories,
    ...(menu.uncategorized.length > 0
      ? [
          {
            id: "sin-categoria",
            name: "Otros",
            display_order: 9999,
            products: menu.uncategorized,
          },
        ]
      : []),
  ];

  return sections.filter((section) => section.products.length > 0);
}
