"use client";

import { NEARBY_RADIUS_DEFAULT_M } from "@/lib/constants";
import { getRestaurantRepository } from "@/lib/restaurants/service";
import type { GeoCoordinates } from "@/lib/restaurants/types";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_RADIUS_M = NEARBY_RADIUS_DEFAULT_M;

export function useNearbyRestaurants(
  searchQuery: string | null,
  origin: GeoCoordinates | null,
  radiusMeters: number = DEFAULT_RADIUS_M,
  options?: { languageCode?: string; staleTime?: number },
) {
  const repo = getRestaurantRepository();
  const languageCode = options?.languageCode;
  const staleTime = options?.staleTime;

  return useQuery({
    queryKey: [
      "restaurants",
      "nearby",
      searchQuery,
      origin?.latitude,
      origin?.longitude,
      radiusMeters,
      languageCode ?? "",
    ],
    queryFn: async () => {
      if (!searchQuery || !origin) {
        return [];
      }
      return repo.findNearby({
        searchQuery,
        origin,
        radiusMeters,
        languageCode: languageCode?.trim() || undefined,
      });
    },
    enabled: Boolean(searchQuery && origin),
    staleTime,
  });
}
