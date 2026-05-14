import { describe, expect, it } from "vitest";
import { collectProfileTags } from "@/data/akinator-flow";
import { MOCK_RESTAURANTS_TEN } from "@/data/mock-restaurants-ten";
import {
  buildAkinatorRankOutput,
  tagOnlyScoreForRestaurant,
} from "@/lib/recommendation/rank-restaurants";

describe("Akinator ranking (mock + fuzzy)", () => {
  it("가상 식당 10곳 + 질문 태그로 displayList가 비지 않는다", () => {
    const answers: Record<string, string> = {
      date_meal: "lunch",
      date_cuisine: "jp",
      date_spicy: "spicy_yes",
      date_seat: "floor",
      date_vibe: "quiet",
      date_budget: "mid",
      date_alcohol: "alc_n",
    };
    const tags = collectProfileTags("date", answers);
    expect(tags.length).toBeGreaterThan(0);

    const out = buildAkinatorRankOutput(MOCK_RESTAURANTS_TEN, tags, new Map(), 10);
    expect(out.displayList.length).toBeGreaterThan(0);
    expect(out.displayList.length).toBeLessThanOrEqual(10);
  });

  it("태그가 전혀 안 맞는 식당만 있어도 베이스 점수로 순위가 유지된다", () => {
    const bland = MOCK_RESTAURANTS_TEN.slice(8);
    const tags = ["spicy_love", "floor_seat", "cuisine_korean"];
    const out = buildAkinatorRankOutput(bland, tags, new Map(), 5);
    expect(out.displayList).toHaveLength(2);
    expect(out.showFallbackHint).toBe(true);
  });

  it("お座敷 / 辛い 키워드가 있으면 tagOnly 점수가 올라간다", () => {
    const r = MOCK_RESTAURANTS_TEN.find((x) => x.id === "mock-4")!;
    const score = tagOnlyScoreForRestaurant(r, ["floor_seat", "spicy_love", "quiet"]);
    expect(score).toBeGreaterThanOrEqual(6);
  });
});
