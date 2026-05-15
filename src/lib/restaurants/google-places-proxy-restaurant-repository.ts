"use client";

import type { IRestaurantRepository } from "@/lib/restaurants/repository";
import type { NearbyRestaurantSearchParams, Restaurant } from "@/lib/restaurants/types";

export class GooglePlacesProxyRestaurantRepository implements IRestaurantRepository {
  async findNearby(params: NearbyRestaurantSearchParams): Promise<Restaurant[]> {
    /** URLSearchParams 가 UTF-8 쿼리 값을 퍼센트 인코딩하므로 한글 검색어도 안전합니다. */
    const search = new URLSearchParams({
      query: params.searchQuery,
      latitude: String(params.origin.latitude),
      longitude: String(params.origin.longitude),
      radiusMeters: String(params.radiusMeters),
    });
    if (params.languageCode?.trim()) {
      search.set("languageCode", params.languageCode.trim());
    }

    const res = await fetch(`/api/restaurants/nearby?${search.toString()}`);

    const payload = (await res.json().catch(() => ({}))) as {
      restaurants?: Restaurant[];
      message?: string;
    };

    if (!res.ok) {
      throw new Error(
        payload.message?.trim() || `가게 목록을 불러오지 못했습니다 (${res.status}).`,
      );
    }

    return payload.restaurants ?? [];
  }
}
