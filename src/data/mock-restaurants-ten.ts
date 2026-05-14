import type { Restaurant } from "@/lib/restaurants/types";

function m(
  id: string,
  name: string,
  types: string[],
  extra?: Partial<Restaurant>,
): Restaurant {
  return {
    id,
    name,
    address: "Machida, Tokyo (mock)",
    coordinates: { latitude: 35.53, longitude: 139.47 },
    placeTypes: types,
    distanceMeters: 200 + id.length * 12,
    rating: 4.0,
    ...extra,
  };
}

/**
 * Places 없이 UI·랭킹만 검증할 가상 10곳.
 *
 * 프리셋 ① (데이트: 점심→일식→매운맛→좌식→조용→예산 보통→음료만) 과
 * **보기(이름·타입)** 가 맞도록 앞쪽이 강한 일식·座敷·個室·辛·静 계열로 배치.
 */
export const MOCK_RESTAURANTS_TEN: Restaurant[] = [
  m(
    "mock-1",
    "座敷個室 和食 辛味噌鍋 静かなランチ",
    ["japanese_restaurant", "restaurant"],
    { rating: 4.85, distanceMeters: 210 },
  ),
  m(
    "mock-2",
    "お座敷 懐石 さくら亭 個室",
    ["japanese_restaurant", "restaurant"],
    { rating: 4.75, distanceMeters: 260 },
  ),
  m(
    "mock-3",
    "辛い料理専門 和ダイニング 町田",
    ["japanese_restaurant", "restaurant"],
    { rating: 4.45, distanceMeters: 300 },
  ),
  m(
    "mock-4",
    "個室のみ 和食コース 落ち着いた空間",
    ["japanese_restaurant", "restaurant"],
    { rating: 4.55, distanceMeters: 330 },
  ),
  /** 조용·좌식 태그와 궁합이 나쁜 대비(시끌·바) */
  m("mock-5", "にぎやか居酒屋 木ノ葉 カウンター", ["bar", "restaurant"], {
    rating: 4.9,
    distanceMeters: 170,
  }),
  m("mock-6", "Spicy Kitchen テーブル席のみ", ["restaurant"], {
    rating: 4.15,
    distanceMeters: 390,
  }),
  m("mock-7", "라멘YAH 町田 カウンター", ["ramen_restaurant", "restaurant"], {
    rating: 4.05,
    distanceMeters: 410,
  }),
  m("mock-8", "焼肉 王道 テーブル席", ["restaurant"], { rating: 4.5, distanceMeters: 430 }),
  m("mock-9", "海鮮丼 浜 テーブル", ["seafood_restaurant", "restaurant"], {
    rating: 4.3,
    distanceMeters: 450,
  }),
  m("mock-10", "ファミレス 町田", ["restaurant"], { rating: 3.5, distanceMeters: 480 }),
];
