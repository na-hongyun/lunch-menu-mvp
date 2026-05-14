import type { Restaurant } from "@/lib/restaurants/types";
import { promotedWeightForPlaceId } from "@/lib/recommendation/promoted-places";

const SCENARIO_SOFT_SIGNALS: Record<string, { keywords?: string[] }> = {
  scenario_date: { keywords: ["데이트", "로맨틱", "루프탑", "야경", "와인", "date"] },
  scenario_office: { keywords: ["점심", "정식", "세트", "직장", "ランチ", "lunch"] },
  scenario_travel: { keywords: ["여행", "관광", "로컬", "旅行"] },
  scenario_family: { keywords: ["룸", "상견례", "가족", "모임", "個室"] },
  scenario_solo: { keywords: ["혼밥", "카운터", "1인", "一人"] },
  scenario_friends: { keywords: ["모임", "단체", "포차", "飲み"] },
};

/** tag id → hints matched against name + address + Google place types (KR/JP fuzzy) */
const TAG_SIGNALS: Record<string, { types?: string[]; keywords?: string[] }> = {
  ...SCENARIO_SOFT_SIGNALS,
  noodles: {
    types: ["ramen_restaurant", "noodle_shop"],
    keywords: [
      "면",
      "국수",
      "라멘",
      "우동",
      "소바",
      "냉면",
      "파스타",
      "noodle",
      "ramen",
      "ラーメン",
      "うどん",
      "そば",
      "麺",
    ],
  },
  rice_hot: {
    types: ["restaurant"],
    keywords: ["밥", "덮밥", "비빔밥", "카레", "rice", "bibimbap", "丼", "どんぶり", "ご飯"],
  },
  meat: {
    keywords: [
      "고기",
      "삼겹",
      "구이",
      "스테이크",
      "bbq",
      "불고기",
      "meat",
      "grill",
      "焼肉",
      "ステーキ",
      "肉",
    ],
  },
  seafood: {
    types: ["seafood_restaurant", "sushi_restaurant"],
    keywords: ["해산", "횟집", "초밥", "sushi", "seafood", "寿司", "刺身", "海鮮"],
  },
  light_veg: {
    keywords: ["샐러드", "채식", "salad", "vegetarian", "サラダ", "野菜"],
  },
  spicy_love: {
    keywords: ["매운", "마라", "떡볶이", "맵", "spicy", "麻辣", "辛い", "激辛", "辛味", "スパイシー"],
  },
  spicy_avoid: {
    keywords: ["순한", "맵지", "辛くない", "マイルド"],
  },
  floor_seat: {
    keywords: [
      "좌식",
      "방석",
      "다다미",
      "tatami",
      "좌탁",
      "お座敷",
      "座敷",
      "掘りごたつ",
      "掘り炬燵",
      "座敷席",
    ],
  },
  table_only: {
    keywords: ["테이블", "의자", "テーブル", "椅子", "席のみ"],
  },
  quiet: {
    keywords: ["룸", "조용", "private", "個室", "静か", "落ち着"],
  },
  lively: {
    keywords: ["활기", "바", "bar", "포차", "居酒屋", "飲み", "にぎやか"],
  },
  cuisine_korean: {
    types: ["korean_restaurant"],
    keywords: ["한식", "korean", "韓国", "韓国料理"],
  },
  cuisine_japanese: {
    types: ["japanese_restaurant", "sushi_restaurant"],
    keywords: ["일식", "초밥", "和食", "日本料理", "懐石", "焼き鳥"],
  },
  cuisine_chinese: {
    types: ["chinese_restaurant"],
    keywords: ["중식", "중국", "中華", "四川", "火鍋"],
  },
  cuisine_western: {
    types: [
      "italian_restaurant",
      "french_restaurant",
      "steak_house",
      "american_restaurant",
    ],
    keywords: ["양식", "파스타", "스테이크", "brunch", "イタリアン", "フレンチ", "洋食", "ビストロ"],
  },
  cuisine_fusion: { keywords: ["퓨전", "fusion", "創作", "ダイニング"] },
  premium: { keywords: ["파인", "fine", "오마카세", "高級", "記念日", "コース"] },
  budget: { keywords: ["분식", "백반", "가성비", "定食", "食堂", "コスパ", "安い"] },
};

/** 태그 매칭이 전혀 없어도 순위가 붕괴되지 않도록 하는 바닥 점수 */
const BASELINE_SCORE = 18;

/** 이 점수 이상이면 “태그가 실제로 어느 정도 맞았다”고 본다 */
const STRONG_TAG_MATCH_THRESHOLD = 5;

function haystack(r: Restaurant): string {
  const typeStr = (r.placeTypes ?? []).join(" ").toLowerCase();
  return `${r.name} ${r.address} ${typeStr}`.toLowerCase();
}

function genericRestaurantBoost(r: Restaurant): number {
  const t = r.placeTypes ?? [];
  if (t.includes("restaurant")) return 5;
  if (t.includes("meal_delivery")) return 2;
  if (t.includes("food")) return 3;
  if (t.includes("bar") || t.includes("cafe")) return 2;
  return 0;
}

function tagMatchScore(tag: string, r: Restaurant): number {
  const spec = TAG_SIGNALS[tag];
  if (!spec) return 0;
  const h = haystack(r);
  let score = 0;
  for (const kw of spec.keywords ?? []) {
    if (h.includes(kw.toLowerCase())) score += 3;
  }
  for (const t of spec.types ?? []) {
    if ((r.placeTypes ?? []).includes(t)) score += 5;
  }
  return score;
}

/** 질문 태그만 합산 (폴백 여부 판단용) */
export function tagOnlyScoreForRestaurant(r: Restaurant, tags: readonly string[]): number {
  let s = 0;
  for (const t of tags) {
    s += tagMatchScore(t, r);
  }
  return s;
}

function ratingBoost(r: Restaurant): number {
  if (typeof r.rating !== "number") return 0;
  return Math.max(0, (r.rating - 3.5) * 4);
}

function distanceBoost(r: Restaurant): number {
  const d = r.distanceMeters;
  if (d === undefined) return 0;
  if (d < 250) return 6;
  if (d < 450) return 4;
  if (d < 700) return 2;
  return 0;
}

export function scoreRestaurantForTags(
  r: Restaurant,
  tags: readonly string[],
  promoted: ReadonlyMap<string, number>,
): number {
  let tagScore = 0;
  for (const t of tags) {
    tagScore += tagMatchScore(t, r);
  }
  return (
    BASELINE_SCORE +
    tagScore * 1.15 +
    ratingBoost(r) +
    distanceBoost(r) +
    promotedWeightForPlaceId(r.id, promoted) +
    genericRestaurantBoost(r)
  );
}

export type AkinatorRankOutput = {
  displayList: Restaurant[];
  /** 태그 직접 일치가 거의 없을 때 안내 + 상위 유사 */
  showFallbackHint: boolean;
  /** 태그 점수가 STRONG 이상인 식당 수 */
  strongMatchCount: number;
};

export function buildAkinatorRankOutput(
  items: Restaurant[],
  tags: readonly string[],
  promoted: ReadonlyMap<string, number>,
  displayLimit = 10,
): AkinatorRankOutput {
  if (items.length === 0) {
    return { displayList: [], showFallbackHint: false, strongMatchCount: 0 };
  }

  const strongMatchCount = items.filter(
    (r) => tagOnlyScoreForRestaurant(r, tags) >= STRONG_TAG_MATCH_THRESHOLD,
  ).length;

  const showFallbackHint = strongMatchCount === 0;

  const ranked = [...items].sort(
    (a, b) =>
      scoreRestaurantForTags(b, tags, promoted) - scoreRestaurantForTags(a, tags, promoted),
  );

  return {
    displayList: ranked.slice(0, Math.min(displayLimit, ranked.length)),
    showFallbackHint,
    strongMatchCount,
  };
}

export function rankRestaurantsByProfile(
  items: Restaurant[],
  tags: readonly string[],
  promoted: ReadonlyMap<string, number>,
  limit = 8,
): Restaurant[] {
  return buildAkinatorRankOutput(items, tags, promoted, limit).displayList;
}
