import { describe, expect, it } from "vitest";
import { parsePromotedPlaceWeights } from "@/lib/recommendation/promoted-places";
import { rankRestaurantsByProfile } from "@/lib/recommendation/rank-restaurants";
import type { Restaurant } from "@/lib/restaurants/types";

function r(
  partial: Pick<Restaurant, "id" | "name" | "address" | "coordinates"> &
    Partial<Omit<Restaurant, "id" | "name" | "address" | "coordinates">>,
): Restaurant {
  return {
    id: partial.id,
    name: partial.name,
    address: partial.address,
    coordinates: partial.coordinates,
    phone: partial.phone,
    distanceMeters: partial.distanceMeters,
    rating: partial.rating,
    userRatingCount: partial.userRatingCount,
    placeTypes: partial.placeTypes,
    primaryPhotoName: partial.primaryPhotoName,
  };
}

describe("rankRestaurantsByProfile", () => {
  it("boosts promoted place ids toward the top", () => {
    const items: Restaurant[] = [
      r({
        id: "places/A",
        name: "A 식당",
        address: "서울",
        coordinates: { latitude: 37.57, longitude: 126.98 },
        distanceMeters: 100,
        rating: 3.6,
        placeTypes: ["restaurant"],
      }),
      r({
        id: "places/B",
        name: "B 한식당",
        address: "서울",
        coordinates: { latitude: 37.57, longitude: 126.98 },
        distanceMeters: 120,
        rating: 3.6,
        placeTypes: ["korean_restaurant"],
      }),
    ];
    const promoted = parsePromotedPlaceWeights("A|200");
    const ranked = rankRestaurantsByProfile(items, ["cuisine_korean"], promoted, 5);
    expect(ranked[0]?.id).toBe("places/A");
  });

  it("prefers stronger tag matches in the name or types", () => {
    const items: Restaurant[] = [
      r({
        id: "places/X",
        name: "이탈리안 키친",
        address: "서울",
        coordinates: { latitude: 37.57, longitude: 126.98 },
        distanceMeters: 200,
        rating: 4.0,
        placeTypes: ["italian_restaurant"],
      }),
      r({
        id: "places/Y",
        name: "동네 밥집",
        address: "서울",
        coordinates: { latitude: 37.57, longitude: 126.98 },
        distanceMeters: 50,
        rating: 4.0,
        placeTypes: ["restaurant"],
      }),
    ];
    const ranked = rankRestaurantsByProfile(items, ["cuisine_western"], new Map(), 5);
    expect(ranked[0]?.id).toBe("places/X");
  });
});
