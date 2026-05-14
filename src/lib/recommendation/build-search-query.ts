import { PLACES_REGION_CODE } from "@/lib/constants";

const SCENARIO_SHORT: Record<string, string> = {
  date: "데이트",
  office: "회사",
  travel: "여행",
  family: "가족모임",
  solo: "혼밥",
  friends: "친구모임",
};

/**
 * Places Text Search용 **짧은** 쿼리만 만든다.
 * 긴 조합(매운·좌식·조용 등)은 Google이 잘 못 찾고 빈 결과가 나오므로,
 * 그런 힌트는 `rank-restaurants` 태그 매칭에만 쓴다.
 *
 * `regionCode`가 JP일 때 한국어 위주 쿼리만으로는 일본 좌표 근처에서 0건이 나오는 경우가
 * 많아, 같은 의미의 일본어·英語 토큰을 덧붙인다.
 */
export function buildPlacesTextQuery(scenarioId: string, tagList: string[]): string {
  const tags = new Set(tagList);

  const meal = tags.has("meal_dinner")
    ? "저녁"
    : tags.has("meal_brunch")
      ? "브런치"
      : "점심";

  let dish = "식당";
  if (tags.has("cuisine_korean")) dish = "한식";
  else if (tags.has("cuisine_japanese")) dish = "일식";
  else if (tags.has("cuisine_chinese")) dish = "중식";
  else if (tags.has("cuisine_western")) dish = "양식";
  else if (tags.has("cuisine_fusion")) dish = "카페";
  else if (tags.has("cuisine_any")) dish = "맛집";

  const scene = SCENARIO_SHORT[scenarioId] ?? "식사";

  let q = `${meal} ${dish} ${scene}`.replace(/\s+/g, " ").trim();

  if (PLACES_REGION_CODE === "JP") {
    const jp: string[] = [];
    if (tags.has("cuisine_korean")) jp.push("韓国料理", "Korean");
    if (tags.has("cuisine_japanese")) jp.push("日本料理");
    if (tags.has("cuisine_chinese")) jp.push("中華料理");
    if (tags.has("cuisine_western")) jp.push("洋食", "イタリアン");
    if (tags.has("cuisine_fusion")) jp.push("ダイニング");
    if (tags.has("meat")) jp.push("焼肉", "肉料理");
    if (tags.has("seafood")) jp.push("海鮮", "寿司");
    if (tags.has("lively")) jp.push("居酒屋");
    if (tags.has("noodles")) jp.push("ラーメン", "麺");
    jp.push("レストラン");
    q = `${q} ${jp.join(" ")}`.replace(/\s+/g, " ").trim();
  }

  return q;
}
