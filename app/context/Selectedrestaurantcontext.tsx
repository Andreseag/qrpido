"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const STORAGE_KEY = "selected_restaurant_id";

interface SelectedRestaurantContextValue {
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
}

const SelectedRestaurantContext = createContext<
  SelectedRestaurantContextValue | undefined
>(undefined);

export function SelectedRestaurantProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedRestaurantId, setSelectedRestaurantIdState] = useState<
    string | null
  >(null);

  // Recuperar la selección guardada al montar (solo existe en el cliente)
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setSelectedRestaurantIdState(stored);
  }, []);

  const setSelectedRestaurantId = useCallback((id: string | null) => {
    setSelectedRestaurantIdState(id);
    if (id) {
      window.localStorage.setItem(STORAGE_KEY, id);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <SelectedRestaurantContext.Provider
      value={{ selectedRestaurantId, setSelectedRestaurantId }}>
      {children}
    </SelectedRestaurantContext.Provider>
  );
}

export function useSelectedRestaurant() {
  const ctx = useContext(SelectedRestaurantContext);
  if (!ctx) {
    throw new Error(
      "useSelectedRestaurant debe usarse dentro de un SelectedRestaurantProvider",
    );
  }
  return ctx;
}
