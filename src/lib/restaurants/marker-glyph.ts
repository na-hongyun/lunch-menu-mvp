import type { Restaurant } from "@/lib/restaurants/types";

/** Places `types` → 마커 중앙 이모지 (트렌디 커스텀 마커용) */
const TYPE_TO_GLYPH: Record<string, string> = {
  ramen_restaurant: "🍜",
  sushi_restaurant: "🍣",
  japanese_restaurant: "🍱",
  korean_restaurant: "🥘",
  chinese_restaurant: "🥟",
  italian_restaurant: "🍝",
  pizza_restaurant: "🍕",
  hamburger_restaurant: "🍔",
  cafe: "☕",
  bar: "🍸",
  bakery: "🥐",
  seafood_restaurant: "🦐",
  steak_house: "🥩",
  fast_food_restaurant: "🍟",
  brunch_restaurant: "🥞",
  american_restaurant: "🌭",
  french_restaurant: "🥖",
  indian_restaurant: "🍛",
  thai_restaurant: "🌶️",
  vietnamese_restaurant: "🍜",
  pub: "🍺",
  restaurant: "🍽️",
  food: "🍽️",
};

export function markerGlyphForRestaurant(
  restaurant: Pick<Restaurant, "placeTypes">,
): string {
  const types = restaurant.placeTypes ?? [];
  for (const t of types) {
    const g = TYPE_TO_GLYPH[t];
    if (g) return g;
  }
  return "🍽️";
}
