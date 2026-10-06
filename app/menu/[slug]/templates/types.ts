import { PublicMenuCategory } from "../types";

export interface MenuTemplateProps {
  restaurantName: string;
  logoUrl: string | null;
  sections: PublicMenuCategory[];
}
