import { describe, expect, it } from "vitest";
import { summarizeRestaurantPlaceKinds } from "@/lib/format/place-types-ko";

describe("summarizeRestaurantPlaceKinds", () => {
  it("prefers categoryLabel when set", () => {
    expect(
      summarizeRestaurantPlaceKinds({
        categoryLabel: "  데이트  ",
        placeTypes: ["restaurant"],
      }),
    ).toBe("데이트");
  });

  it("maps known place types to Korean", () => {
    expect(
      summarizeRestaurantPlaceKinds({
        categoryLabel: undefined,
        placeTypes: ["italian_restaurant", "restaurant", "meal_delivery"],
      }),
    ).toBe("이탈리안 · 음식점 · 배달");
  });

  it("falls back to readable English-ish tokens", () => {
    expect(
      summarizeRestaurantPlaceKinds({
        categoryLabel: undefined,
        placeTypes: ["xyz_unknown_type", "another_type"],
      }),
    ).toBe("xyz unknown type · another type");
  });
});
