"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Member, FeedbackMessage, CreateUserPayload } from "../types";
import { useSelectedRestaurant } from "@/app/context/Selectedrestaurantcontext";

export interface RestaurantContext {
  id: number;
  name: string;
  role: string;
}

export function useAdminSettings() {
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<RestaurantContext[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  const router = useRouter();

  // Selección persistida globalmente (Context + localStorage)
  const { selectedRestaurantId } = useSelectedRestaurant();

  const fetchMembers = useCallback(async (restId: number) => {
    const { data: teamData, error: teamError } = await supabase
      .from("restaurant_members")
      .select("user_id, role, full_name")
      .eq("restaurant_id", restId);

    if (!teamError && teamData) {
      setMembers(teamData);
    }
  }, []);

  // 1. Validar sesión y traer todos los restaurantes del usuario
  useEffect(() => {
    const initSettings = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data: memberData, error } = await supabase
        .from("restaurant_members")
        .select(
          `
          role,
          restaurants (
            id,
            name
          )
        `,
        )
        .eq("user_id", session.user.id);

      if (error || !memberData || memberData.length === 0) {
        setConfigError(
          "No se encontraron restaurantes asociados a este usuario.",
        );
        setLoading(false);
        return;
      }

      // Mapear sucursales disponibles
      const mappedRestaurants: RestaurantContext[] = memberData
        .filter((item: any) => item.restaurants)
        .map((item: any) => ({
          id: item.restaurants.id,
          name: item.restaurants.name,
          role: item.role,
        }));

      setRestaurants(mappedRestaurants);
    };

    initSettings();
  }, [router]);

  // 2. Sincronizar sucursal activa con selectedRestaurantId del contexto global y activar el cargador
  useEffect(() => {
    if (restaurants.length === 0) return;

    const syncRestaurant = async () => {
      setLoading(true);

      const activeRest =
        restaurants.find(
          (r) => r.id.toString() === selectedRestaurantId?.toString(),
        ) || restaurants[0];

      setRestaurantId(activeRest.id);
      setRestaurantName(activeRest.name);
      setIsOwner(activeRest.role === "owner");
      localStorage.setItem("active_restaurant_id", activeRest.id.toString());

      await fetchMembers(activeRest.id);
      setLoading(false);
    };

    syncRestaurant();
  }, [selectedRestaurantId, restaurants, fetchMembers]);

  // 3. Cambiar de sucursal activa desde el selector
  const changeActiveRestaurant = useCallback(
    async (newId: number) => {
      const selected = restaurants.find((r) => r.id === newId);
      if (!selected) return;

      setLoading(true);
      setRestaurantId(selected.id);
      setRestaurantName(selected.name);
      setIsOwner(selected.role === "owner");
      localStorage.setItem("active_restaurant_id", selected.id.toString());
      window.dispatchEvent(new Event("storage"));

      await fetchMembers(selected.id);
      setLoading(false);
    },
    [restaurants, fetchMembers],
  );

  // 4. Actualizar nombre del restaurante activo
  const updateRestaurantName = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!restaurantId) return;
      setSaving(true);
      setMessage(null);

      const { error } = await supabase
        .from("restaurants")
        .update({ name: restaurantName })
        .eq("id", restaurantId);

      setSaving(false);
      if (error) {
        setMessage({
          type: "error",
          text: "Hubo un error al actualizar el nombre del restaurante.",
        });
      } else {
        setMessage({
          type: "success",
          text: "¡Restaurante actualizado con éxito!",
        });
        // Actualizar el nombre localmente en el listado de franquicias
        setRestaurants((prev) =>
          prev.map((r) =>
            r.id === restaurantId ? { ...r, name: restaurantName } : r,
          ),
        );
      }
    },
    [restaurantId, restaurantName],
  );

  // 5. Cambiar rol de un miembro
  const changeMemberRole = useCallback(
    async (userId: string, newRole: string) => {
      if (!restaurantId) return;

      const { data, error } = await supabase
        .from("restaurant_members")
        .update({ role: newRole })
        .eq("restaurant_id", restaurantId)
        .eq("user_id", userId)
        .select();

      if (error || !data || data.length === 0) {
        console.error("Error o RLS bloqueó el update:", error);
        setMessage({
          type: "error",
          text: "No se pudo actualizar. Las políticas RLS están bloqueando el cambio.",
        });
      } else {
        setMembers((prev) =>
          prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m)),
        );
        setMessage({ type: "success", text: "Rol actualizado correctamente." });
      }
    },
    [restaurantId],
  );

  // 6. Quitar miembro del restaurante
  const removeMember = useCallback(
    async (userId: string) => {
      if (!confirm("¿Estás seguro de quitar a este usuario del restaurante?"))
        return;
      if (!restaurantId) return;

      const { error } = await supabase
        .from("restaurant_members")
        .delete()
        .eq("restaurant_id", restaurantId)
        .eq("user_id", userId);

      if (error) {
        setMessage({ type: "error", text: "No se pudo eliminar al miembro." });
      } else {
        setMembers((prev) => prev.filter((m) => m.user_id !== userId));
        setMessage({ type: "success", text: "Miembro removido exitosamente." });
      }
    },
    [restaurantId],
  );

  // 7. Crear nuevo usuario y asignarlo a la sucursal activa
  const createUser = useCallback(
    async (payload: CreateUserPayload) => {
      if (!restaurantId) return false;
      setCreating(true);
      setMessage(null);

      try {
        const res = await fetch("/api/create-restaurant-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            restaurant_id: restaurantId,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Error al crear el usuario.");
        }

        setMessage({
          type: "success",
          text: "¡Usuario creado y asignado con éxito!",
        });

        await fetchMembers(restaurantId);
        return true;
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err.message || "Error al registrar usuario.",
        });
        return false;
      } finally {
        setCreating(false);
      }
    },
    [restaurantId, fetchMembers],
  );

  return {
    loading,
    configError,
    isOwner,
    restaurants,
    restaurantId,
    restaurantName,
    setRestaurantName,
    changeActiveRestaurant,
    saving,
    updateRestaurantName,
    members,
    changeMemberRole,
    removeMember,
    creating,
    createUser,
    message,
  };
}
