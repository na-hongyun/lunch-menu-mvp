"use client";

import { RestaurantMapExplorerProvider } from "@/contexts/restaurant-map-explorer-context";
import { useSavedRestaurants } from "@/contexts/saved-restaurants-context";
import type { Restaurant } from "@/lib/restaurants/types";
import { useMemo, type ReactNode } from "react";

export interface MergedMapExplorerProviderProps {
  /**
   * 질문 완료 후 Places 탐색 구간(reveal·results)에서 true.
   * ranked가 잠깐 비어 있어도 true여야 로딩 끝에 마커가 다시 붙는다.
   */
  searchActive: boolean;
  /** undefined면 []로 취급 */
  nearbyRestaurants: Restaurant[] | undefined;
  children: ReactNode;
}

/**
 * 周辺検索結果とマイリスト保存店をマージし、マーカー・選択状態を一貫させる。
 */
export function MergedMapExplorerProvider({
  searchActive,
  nearbyRestaurants,
  children,
}: MergedMapExplorerProviderProps) {
  const { savedRestaurants } = useSavedRestaurants();

  const mergedRestaurants = useMemo(() => {
    if (!searchActive) return undefined;
    const nearby = nearbyRestaurants ?? [];
    const byId = new Map<string, Restaurant>();
    for (const s of savedRestaurants) byId.set(s.id, s);
    for (const r of nearby) byId.set(r.id, r);
    return [...byId.values()];
  }, [searchActive, nearbyRestaurants, savedRestaurants]);

  return (
    <RestaurantMapExplorerProvider restaurants={mergedRestaurants}>
      {children}
    </RestaurantMapExplorerProvider>
  );
}
