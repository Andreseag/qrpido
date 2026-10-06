"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/app/lib/supabase";
import { MenuCategory } from "../types";
import { useActiveRestaurant } from "@/app/hooks/Useactiverestaurant";

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
  const [themePalette, setThemePalette] = useState("amber_classic");
  const [menuTemplate, setMenuTemplate] = useState("classic");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const fetchAll = useCallback(async (restaurantId: string) => {
    setLoadingMenu(true);
    const [{ data: restaurantData }, { data: categoriesData }] =
      await Promise.all([
        supabase
          .from("restaurants")
          .select(
            "slug, menu_is_public, theme_palette, menu_template, logo_url",
          )
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
      setThemePalette(restaurantData.theme_palette || "amber_classic");
      setMenuTemplate(restaurantData.menu_template || "classic");
      setLogoUrl(restaurantData.logo_url || null);
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

  const saveThemePalette = useCallback(
    async (paletteId: string) => {
      if (!activeRestaurant) return false;
      // Optimista: se ve el cambio de inmediato en el selector
      const previous = themePalette;
      setThemePalette(paletteId);

      const { data, error } = await supabase
        .from("restaurants")
        .update({ theme_palette: paletteId })
        .eq("id", activeRestaurant.id)
        .select("id");

      if (error || !data || data.length === 0) {
        setThemePalette(previous); // revertir: no se guardó
        return false;
      }

      return !error;
    },
    [activeRestaurant, themePalette],
  );

  const saveMenuTemplate = useCallback(
    async (templateId: string) => {
      if (!activeRestaurant) return false;
      setMenuTemplate(templateId);
      const { error } = await supabase
        .from("restaurants")
        .update({ menu_template: templateId })
        .eq("id", activeRestaurant.id);
      return !error;
    },
    [activeRestaurant],
  );

  const uploadLogo = useCallback(
    async (file: File) => {
      if (!activeRestaurant) return false;
      setUploadingLogo(true);
      try {
        const filePath = `${activeRestaurant.id}/logo-${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("menu-images")
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from("restaurants")
          .update({ logo_url: data.publicUrl })
          .eq("id", activeRestaurant.id);
        if (updateError) throw updateError;

        setLogoUrl(data.publicUrl);
        return true;
      } catch {
        return false;
      } finally {
        setUploadingLogo(false);
      }
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
    themePalette,
    saveThemePalette,
    menuTemplate,
    saveMenuTemplate,
    logoUrl,
    uploadingLogo,
    uploadLogo,
    categories,
    createCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
  };
}
