"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";

interface Toast {
  message: string;
  type: "success" | "error";
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: boolean;
  restaurant_id: string;
  category_id: string | null;
  description: string | null;
  image_url: string | null;
}

interface ProductFormData {
  name: string;
  price: string;
  cost: string;
  stock: boolean;
  categoryId: string | null;
  description: string;
  imageFile: File | null;
  imageUrl: string | null;
}

const emptyFormData: ProductFormData = {
  name: "",
  price: "",
  cost: "",
  stock: true,
  categoryId: null,
  description: "",
  imageFile: null,
  imageUrl: null,
};

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);

  // Selección persistida globalmente (Context + localStorage)
  const { selectedRestaurantId } = useSelectedRestaurant();

  // Escuchar cambios en el restaurante activo para recargar inventario y categorías
  useEffect(() => {
    if (selectedRestaurantId) {
      fetchInventory(selectedRestaurantId);
      fetchCategories(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchInventory = async (restId: string) => {
    if (!restId) return;
    setLoading(true);

    const { data: productsData, error } = await supabase
      .from("products")
      .select("*")
      .eq("restaurant_id", restId)
      .order("name");

    if (error) {
      showToast("Error al cargar el inventario: " + error.message, "error");
    } else if (productsData) {
      setProducts(productsData);
    }
    setLoading(false);
  };

  // Categorías del Menú Digital — para asignar cada producto a una sección
  const fetchCategories = async (restId: string) => {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("id, name")
      .eq("restaurant_id", restId)
      .order("display_order", { ascending: true });

    if (!error && data) setCategories(data);
  };

  // Sube la foto del producto al bucket público del Menú Digital
  const uploadProductImage = async (
    restaurantId: string,
    file: File,
  ): Promise<string> => {
    const filePath = `${restaurantId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("menu-images")
      .upload(filePath, file);

    if (error) {
      throw new Error("No se pudo subir la imagen: " + error.message);
    }

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const toggleStock = async (id: string, currentStatus: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: !currentStatus } : p)),
    );
    const { error } = await supabase
      .from("products")
      .update({ stock: !currentStatus })
      .eq("id", id);

    if (error) {
      showToast("Error al actualizar el estado", "error");
    } else {
      showToast(
        !currentStatus
          ? "Plato marcado como disponible"
          : "Plato marcado como agotado",
      );
    }
  };

  const openCreateDrawer = () => {
    setEditingProduct(null);
    setFormData(emptyFormData);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      cost: (product.cost || 0).toString(),
      stock: product.stock,
      categoryId: product.category_id,
      description: product.description || "",
      imageFile: null,
      imageUrl: product.image_url,
    });
    setIsDrawerOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurantId) return;

    setSaving(true);

    const priceNum = parseFloat(formData.price);
    const costNum = parseFloat(formData.cost) || 0;

    // Si hay una foto nueva seleccionada, se sube primero; si no, se
    // conserva la URL que ya tenía el producto (o null si nunca tuvo).
    let imageUrl = formData.imageUrl;
    if (formData.imageFile) {
      try {
        imageUrl = await uploadProductImage(
          selectedRestaurantId,
          formData.imageFile,
        );
      } catch (err: any) {
        showToast(err.message || "Error al subir la imagen", "error");
        setSaving(false);
        return;
      }
    }

    const payload = {
      name: formData.name,
      price: priceNum,
      cost: costNum,
      stock: formData.stock,
      category_id: formData.categoryId,
      description: formData.description || null,
      image_url: imageUrl,
    };

    if (editingProduct) {
      const { data, error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id)
        .select();

      setSaving(false);

      if (error) {
        showToast("Error al actualizar: " + error.message, "error");
      } else if (!data || data.length === 0) {
        showToast(
          "Error: No se encontró el producto o RLS bloqueó el cambio",
          "error",
        );
      } else {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? (data[0] as Product) : p,
          ),
        );
        setIsDrawerOpen(false);
        setEditingProduct(null);
        showToast("¡Producto actualizado con éxito!");
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert([{ ...payload, restaurant_id: selectedRestaurantId }])
        .select();

      setSaving(false);

      if (error) {
        showToast("Error al crear: " + error.message, "error");
      } else if (data) {
        setProducts((prev) => [...prev, data[0] as Product]);
        setIsDrawerOpen(false);
        setFormData(emptyFormData);
        showToast("¡Producto creado con éxito!");
      }
    }
  };

  return {
    products,
    categories,
    loading,
    saving,
    restaurantId: selectedRestaurantId,
    isDrawerOpen,
    setIsDrawerOpen,
    editingProduct,
    toast,
    formData,
    setFormData,
    showToast,
    fetchInventory: () =>
      selectedRestaurantId && fetchInventory(selectedRestaurantId),
    toggleStock,
    openCreateDrawer,
    openEditDrawer,
    handleSubmitProduct,
  };
}
