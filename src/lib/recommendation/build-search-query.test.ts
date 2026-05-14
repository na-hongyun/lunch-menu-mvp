import { describe, expect, it } from "vitest";
import { buildPlacesTextQuery } from "@/lib/recommendation/build-search-query";

describe("buildPlacesTextQuery", () => {
  it("keeps Places query short (broad match + ranking for details)", () => {
    const q = buildPlacesTextQuery("date", [
      "scenario_date",
      "cuisine_korean",
      "spicy_love",
      "floor_seat",
      "quiet",
      "premium",
    ]);
    expect(q).toMatch(/점심/);
    expect(q).toMatch(/한식/);
    expect(q).toMatch(/데이트/);
    expect(q).not.toMatch(/좌식/);
    expect(q).toMatch(/韓国料理/);
    expect(q).toMatch(/レストラン/);
  });
});
