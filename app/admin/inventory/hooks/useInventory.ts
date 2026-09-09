"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";

interface Toast {
  message: string;
  type: "success" | "error";
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: boolean;
  restaurant_id: string;
}

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cost: "",
    stock: true,
  });

  // Selección persistida globalmente (Context + localStorage)
  const { selectedRestaurantId } = useSelectedRestaurant();

  // Escuchar cambios en el restaurante activo para recargar el inventario automáticamente
  useEffect(() => {
    if (selectedRestaurantId) {
      fetchInventory(selectedRestaurantId);
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
    setFormData({ name: "", price: "", cost: "", stock: true });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      cost: (product.cost || 0).toString(),
      stock: product.stock,
    });
    setIsDrawerOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurantId) return;

    const priceNum = parseFloat(formData.price);
    const costNum = parseFloat(formData.cost) || 0;

    if (editingProduct) {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: formData.name,
          price: priceNum,
          cost: costNum,
          stock: formData.stock,
        })
        .eq("id", editingProduct.id)
        .select();

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
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: formData.name,
                  price: priceNum,
                  cost: costNum,
                  stock: formData.stock,
                }
              : p,
          ),
        );
        setIsDrawerOpen(false);
        setEditingProduct(null);
        showToast("¡Producto actualizado con éxito!");
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name: formData.name,
            price: priceNum,
            cost: costNum,
            stock: formData.stock,
            restaurant_id: selectedRestaurantId,
          },
        ])
        .select();

      if (error) {
        showToast("Error al crear: " + error.message, "error");
      } else if (data) {
        setProducts([...products, data[0]]);
        setIsDrawerOpen(false);
        setFormData({ name: "", price: "", cost: "", stock: true });
        showToast("¡Producto creado con éxito!");
      }
    }
  };

  return {
    products,
    loading,
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
