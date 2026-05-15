"use client";

import { markerGlyphForRestaurant } from "@/lib/restaurants/marker-glyph";
import type { Restaurant } from "@/lib/restaurants/types";
import { cn } from "@/lib/utils";

export interface RestaurantMapMarkerPinProps {
  restaurant: Pick<Restaurant, "placeTypes">;
  selected: boolean;
  saved: boolean;
}

/**
 * AdvancedMarker 子: デフォルト Pin の代わりにカテゴリ絵文字の円形マーカー。
 */
export function RestaurantMapMarkerPin({
  restaurant,
  selected,
  saved,
}: RestaurantMapMarkerPinProps) {
  const glyph = markerGlyphForRestaurant(restaurant);

  const bg = selected ? "#0ea5e9" : saved ? "#10b981" : "#64748b";
  const ring = selected ? "0 0 0 3px rgba(14,165,233,0.45)" : "0 8px 22px -6px rgba(0,0,0,0.45)";

  return (
    <div
      className={cn(
        "flex size-[2.75rem] select-none items-center justify-center rounded-full border-[3px] border-white text-[1.35rem] leading-none shadow-lg transition-[transform,box-shadow] duration-300 ease-out",
        selected && "scale-[1.14] z-10",
        !selected && "scale-100",
      )}
      style={{
        backgroundColor: bg,
        boxShadow: ring,
      }}
      aria-hidden
    >
      <span className="drop-shadow-sm">{glyph}</span>
    </div>
  );
}
