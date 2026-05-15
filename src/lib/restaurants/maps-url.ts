import type { Restaurant } from "@/lib/restaurants/types";

/**
 * Google Places `googleMapsUri`가 있으면 사용하고, 없으면 좌표 기준 검색 URL로 폴백합니다.
 */
export function resolveRestaurantMapsUrl(restaurant: Restaurant): string {
  const direct = restaurant.mapsUrl?.trim();
  if (direct) return direct;

  const { latitude, longitude } = restaurant.coordinates;
  const label = `${restaurant.name} ${restaurant.address}`.trim();
  const query = encodeURIComponent(
    label.length > 0 ? label : `${latitude},${longitude}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function resolveNaverMapSearchUrl(restaurant: Restaurant): string {
  const raw =
    restaurant.name.trim() ||
    restaurant.address.trim() ||
    `${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`;
  return `https://map.naver.com/p/search/${encodeURIComponent(raw)}`;
}
