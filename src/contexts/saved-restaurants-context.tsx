"use client";

import type { Restaurant } from "@/lib/restaurants/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface SavedRestaurantsContextValue {
  savedRestaurants: Restaurant[];
  addSavedRestaurant: (restaurant: Restaurant) => void;
  removeSavedRestaurant: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const SavedRestaurantsContext =
  createContext<SavedRestaurantsContextValue | null>(null);

export function SavedRestaurantsProvider({ children }: { children: ReactNode }) {
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);

  const addSavedRestaurant = useCallback((restaurant: Restaurant) => {
    setSavedRestaurants((prev) => {
      if (prev.some((r) => r.id === restaurant.id)) return prev;
      return [...prev, restaurant];
    });
  }, []);

  const removeSavedRestaurant = useCallback((id: string) => {
    setSavedRestaurants((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const isSaved = useCallback(
    (id: string) => savedRestaurants.some((r) => r.id === id),
    [savedRestaurants],
  );

  const value = useMemo<SavedRestaurantsContextValue>(
    () => ({
      savedRestaurants,
      addSavedRestaurant,
      removeSavedRestaurant,
      isSaved,
    }),
    [savedRestaurants, addSavedRestaurant, removeSavedRestaurant, isSaved],
  );

  return (
    <SavedRestaurantsContext.Provider value={value}>
      {children}
    </SavedRestaurantsContext.Provider>
  );
}

export function useSavedRestaurants(): SavedRestaurantsContextValue {
  const ctx = useContext(SavedRestaurantsContext);
  if (!ctx) {
    throw new Error(
      "useSavedRestaurants must be used within SavedRestaurantsProvider",
    );
  }
  return ctx;
}
