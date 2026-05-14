import { haversineDistanceMeters } from "@/lib/geo/haversine";
import { MOCK_RESTAURANTS } from "@/lib/restaurants/mock-data";
import type { IRestaurantRepository } from "@/lib/restaurants/repository";
import type { NearbyRestaurantSearchParams, Restaurant } from "@/lib/restaurants/types";

export class MockRestaurantRepository implements IRestaurantRepository {
  async findNearby(params: NearbyRestaurantSearchParams): Promise<Restaurant[]> {
    const { searchQuery, origin, radiusMeters } = params;
    const tokens = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .map((v) => v.trim())
      .filter(Boolean);

    const matched = MOCK_RESTAURANTS.filter((r) =>
      tokens.length === 0
        ? true
        : tokens.some(
            (t) =>
              r.name.toLowerCase().includes(t) ||
              (r.leafCategoryIds ?? []).some((id) => id.toLowerCase().includes(t)),
          ),
    );

    const withDistance: Restaurant[] = matched.map((r) => {
      const distanceMeters = Math.round(
        haversineDistanceMeters(origin, r.coordinates),
      );
      return { ...r, distanceMeters };
    });

    return withDistance
      .filter((r) => (r.distanceMeters ?? Infinity) <= radiusMeters)
      .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  }
}
