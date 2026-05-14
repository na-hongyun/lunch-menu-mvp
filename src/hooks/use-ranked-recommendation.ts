"use client";

import { buildPlacesTextQuery } from "@/lib/recommendation/build-search-query";
import {
  buildAkinatorRankOutput,
  type AkinatorRankOutput,
} from "@/lib/recommendation/rank-restaurants";
import { parsePromotedPlaceWeights } from "@/lib/recommendation/promoted-places";
import { PLACES_TEXT_LANGUAGE } from "@/lib/constants";
import { getRestaurantRepository } from "@/lib/restaurants/service";
import type { GeoCoordinates } from "@/lib/restaurants/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const STALE_MS = 1000 * 60 * 6;

export function useRankedRecommendation(
  enabled: boolean,
  scenarioId: string | null,
  tags: string[],
  origin: GeoCoordinates | null,
  radiusMeters: number,
) {
  const searchQuery = useMemo(() => {
    if (!scenarioId || tags.length === 0) return null;
    return buildPlacesTextQuery(scenarioId, tags);
  }, [scenarioId, tags]);

  const promoted = useMemo(
    () => parsePromotedPlaceWeights(process.env.NEXT_PUBLIC_PROMOTED_PLACES),
    [],
  );

  const tagKey = useMemo(() => [...tags].sort().join("|"), [tags]);

  const repo = getRestaurantRepository();

  return useQuery<AkinatorRankOutput>({
    queryKey: [
      "ranked-rec",
      searchQuery,
      origin?.latitude,
      origin?.longitude,
      radiusMeters,
      tagKey,
    ],
    queryFn: async () => {
      if (!searchQuery || !origin) {
        return { displayList: [], showFallbackHint: false, strongMatchCount: 0 };
      }

      if (typeof window !== "undefined") {
        console.log("[pipeline] API 직전 searchQuery =", searchQuery);
        console.log("[pipeline] API 직전 tagKey =", tagKey);
        console.log("[pipeline] API 직전 origin =", JSON.stringify(origin));
        console.log("[pipeline] API 직전 radiusMeters =", radiusMeters);
      }

      const raw = await repo.findNearby({
        searchQuery,
        origin,
        radiusMeters,
        languageCode: PLACES_TEXT_LANGUAGE,
      });

      if (typeof window !== "undefined") {
        console.log("[pipeline] Places raw 수신", {
          rawCount: raw.length,
          firstName: raw[0]?.name ?? null,
          firstCoords: raw[0]?.coordinates ?? null,
        });
      }

      const ranked = buildAkinatorRankOutput(raw, tags, promoted, 10);
      if (typeof window !== "undefined") {
        console.log("[pipeline] buildAkinatorRankOutput 직후", {
          displayListLen: ranked.displayList.length,
          strongMatchCount: ranked.strongMatchCount,
          showFallbackHint: ranked.showFallbackHint,
        });
      }
      return ranked;
    },
    enabled: enabled && Boolean(searchQuery && origin),
    staleTime: STALE_MS,
    /**
     * 이전 검색 결과를 placeholder로 두면 질문·시나리오만 바꿔도
     * 옛 목록·맵 마커·선택이 잠깐 남아 사진·요약이 엇갈린 것처럼 보인다.
     * 같은 키로 백그라운드 refetch할 때는 캐시된 data가 그대로 유지된다.
     */
  });
}
