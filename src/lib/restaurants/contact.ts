import type { Restaurant } from "@/lib/restaurants/types";

/** Google Places 등에서 값이 없을 때 표시 */
export const INFO_MISSING = "정보 없음";

/** 표시·전화용: formattedPhoneNumber(국가 형식 우선) → phone 레거시 */
export function restaurantPrimaryPhoneDisplay(restaurant: Restaurant): string {
  return (
    restaurant.formattedPhoneNumber?.trim() ||
    restaurant.phone?.trim() ||
    ""
  );
}

export function restaurantTelHref(restaurant: Restaurant): string | undefined {
  const display = restaurantPrimaryPhoneDisplay(restaurant);
  if (!display) return undefined;
  return `tel:${display.replace(/\s/g, "")}`;
}
