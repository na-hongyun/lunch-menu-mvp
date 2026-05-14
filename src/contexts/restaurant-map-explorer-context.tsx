"use client";

import type { Restaurant } from "@/lib/restaurants/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const EMPTY_LIST: Restaurant[] = [];

export interface RestaurantMapExplorerContextValue {
  restaurants: Restaurant[];
  selectedRestaurantId: string | null;
  /** 同じ ID を再度選ぶと選択解除 */
  selectRestaurant: (id: string | null) => void;
}

const RestaurantMapExplorerContext =
  createContext<RestaurantMapExplorerContextValue | null>(null);

export interface RestaurantMapExplorerProviderProps {
  children: ReactNode;
  /** React Query の data — リスト変更時に選択を検証して整合させる */
  restaurants: Restaurant[] | undefined;
}

export function RestaurantMapExplorerProvider({
  children,
  restaurants,
}: RestaurantMapExplorerProviderProps) {
  const list = restaurants ?? EMPTY_LIST;

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[pipeline] RestaurantMapExplorerProvider list", {
        length: list.length,
        ids: list.slice(0, 6).map((r) => r.id),
      });
    }
  }, [list]);

  useEffect(() => {
    queueMicrotask(() => {
      if (!list.length) {
        setSelectedRestaurantId(null);
        return;
      }
      setSelectedRestaurantId((prev) =>
        prev && list.some((r) => r.id === prev) ? prev : null,
      );
    });
  }, [list]);

  const selectRestaurant = useCallback((id: string | null) => {
    setSelectedRestaurantId((prev) => {
      if (id === null) {
        return null;
      }
      return prev === id ? null : id;
    });
  }, []);

  const value = useMemo<RestaurantMapExplorerContextValue>(
    () => ({
      restaurants: list,
      selectedRestaurantId,
      selectRestaurant,
    }),
    [list, selectedRestaurantId, selectRestaurant],
  );

  return (
    <RestaurantMapExplorerContext.Provider value={value}>
      {children}
    </RestaurantMapExplorerContext.Provider>
  );
}

export function useRestaurantMapExplorer(): RestaurantMapExplorerContextValue {
  const ctx = useContext(RestaurantMapExplorerContext);
  if (!ctx) {
    throw new Error(
      "useRestaurantMapExplorer must be used within RestaurantMapExplorerProvider",
    );
  }
  return ctx;
}
