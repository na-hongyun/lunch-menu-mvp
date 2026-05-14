import type { Restaurant } from "@/lib/restaurants/types";

/** Google Places `types` よくある値 → 한 줄 힌트 (없으면 null) */
const PLACE_TYPE_KO: Record<string, string> = {
  restaurant: "음식점",
  food: "음식점",
  meal_takeaway: "포장",
  meal_delivery: "배달",
  cafe: "카페",
  bar: "바",
  bakery: "베이커리",
  japanese_restaurant: "일식",
  korean_restaurant: "한식",
  chinese_restaurant: "중식",
  italian_restaurant: "이탈리안",
  french_restaurant: "프렌치",
  indian_restaurant: "인도 요리",
  thai_restaurant: "태국 요리",
  vietnamese_restaurant: "베트남 요리",
  ramen_restaurant: "라멘",
  sushi_restaurant: "스시",
  pizza_restaurant: "피자",
  hamburger_restaurant: "햄버거",
  steak_house: "스테이크",
  seafood_restaurant: "해산물",
  brunch_restaurant: "브런치",
  american_restaurant: "아메리칸",
  spanish_restaurant: "스페인",
  fast_food_restaurant: "패스트푸드",
  pub: "펍",
  night_club: "나이트",
};

/**
 * 카드에 보여 줄 짧은 업종·형태 설명.
 */
export function summarizeRestaurantPlaceKinds(
  restaurant: Pick<Restaurant, "categoryLabel" | "placeTypes">,
): string | null {
  const label = restaurant.categoryLabel?.trim();
  if (label) return label;

  const types = restaurant.placeTypes?.filter(Boolean) ?? [];
  if (types.length === 0) return null;

  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of types) {
    const ko = PLACE_TYPE_KO[t];
    if (ko) {
      if (!seen.has(ko)) {
        seen.add(ko);
        out.push(ko);
      }
    }
    if (out.length >= 3) break;
  }
  if (out.length > 0) return out.join(" · ");

  return types
    .slice(0, 2)
    .map((t) => t.replace(/_/g, " "))
    .join(" · ");
}
