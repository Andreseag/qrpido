"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import { useActiveRestaurant } from "@/app/hooks/Useactiverestaurant";
import { MenuCategory } from "../types";

export function useMenuDigital() {
  const {
    restaurants,
    loadingRestaurants,
    activeRestaurant,
    needsSelection,
    selectRestaurant,
  } = useActiveRestaurant();

  const [slug, setSlug] = useState("");
  const [isMenuPublic, setIsMenuPublic] = useState(true);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async (restaurantId: string) => {
    setLoadingMenu(true);
    const [{ data: restaurantData }, { data: categoriesData }] =
      await Promise.all([
        supabase
          .from("restaurants")
          .select("slug, menu_is_public")
          .eq("id", restaurantId)
          .maybeSingle(),
        supabase
          .from("menu_categories")
          .select("*")
          .eq("restaurant_id", restaurantId)
          .order("display_order", { ascending: true }),
      ]);

    if (restaurantData) {
      setSlug(restaurantData.slug || "");
      setIsMenuPublic(restaurantData.menu_is_public ?? true);
    }
    if (categoriesData) setCategories(categoriesData as MenuCategory[]);
    setLoadingMenu(false);
  }, []);

  useEffect(() => {
    if (activeRestaurant) {
      fetchAll(activeRestaurant.id);
    } else {
      setLoadingMenu(false);
    }
  }, [activeRestaurant, fetchAll]);

  const saveSlug = useCallback(
    async (newSlug: string) => {
      if (!activeRestaurant) return false;
      const cleanSlug = newSlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (!cleanSlug) return false;

      setSaving(true);
      const { error } = await supabase
        .from("restaurants")
        .update({ slug: cleanSlug })
        .eq("id", activeRestaurant.id);
      setSaving(false);

      if (error) return false;
      setSlug(cleanSlug);
      return true;
    },
    [activeRestaurant],
  );

  const toggleMenuPublic = useCallback(
    async (value: boolean) => {
      if (!activeRestaurant) return false;
      const { error } = await supabase
        .from("restaurants")
        .update({ menu_is_public: value })
        .eq("id", activeRestaurant.id);
      if (!error) setIsMenuPublic(value);
      return !error;
    },
    [activeRestaurant],
  );

  const createCategory = useCallback(
    async (name: string) => {
      if (!activeRestaurant || !name.trim()) return false;
      const nextOrder = categories.length
        ? Math.max(...categories.map((c) => c.display_order)) + 1
        : 0;

      const { data, error } = await supabase
        .from("menu_categories")
        .insert([
          {
            restaurant_id: activeRestaurant.id,
            name: name.trim(),
            display_order: nextOrder,
          },
        ])
        .select();

      if (error || !data) return false;
      setCategories((prev) => [...prev, data[0] as MenuCategory]);
      return true;
    },
    [activeRestaurant, categories],
  );

  const renameCategory = useCallback(async (id: string, name: string) => {
    if (!name.trim()) return false;
    const { error } = await supabase
      .from("menu_categories")
      .update({ name: name.trim() })
      .eq("id", id);
    if (error) return false;
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)),
    );
    return true;
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", id);
    if (error) return false;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  }, []);

  // Reordenar intercambiando display_order con la categoría vecina —
  // simple y suficiente para listas cortas; si más adelante tienen
  // muchas categorías, ahí sí vale la pena drag-and-drop.
  const moveCategory = useCallback(
    async (id: string, direction: "up" | "down") => {
      const index = categories.findIndex((c) => c.id === id);
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || swapIndex < 0 || swapIndex >= categories.length)
        return;

      const current = categories[index];
      const swap = categories[swapIndex];

      const { error: err1 } = await supabase
        .from("menu_categories")
        .update({ display_order: swap.display_order })
        .eq("id", current.id);
      const { error: err2 } = await supabase
        .from("menu_categories")
        .update({ display_order: current.display_order })
        .eq("id", swap.id);

      if (!err1 && !err2) {
        setCategories((prev) => {
          const next = [...prev];
          next[index] = { ...current, display_order: swap.display_order };
          next[swapIndex] = { ...swap, display_order: current.display_order };
          return next.sort((a, b) => a.display_order - b.display_order);
        });
      }
    },
    [categories],
  );

  return {
    loading: loadingMenu || loadingRestaurants,
    restaurants,
    needsSelection,
    selectRestaurant,
    activeRestaurant,
    slug,
    isMenuPublic,
    saving,
    saveSlug,
    toggleMenuPublic,
    categories,
    createCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
  };
}
