import type { Restaurant } from "@/lib/restaurants/types";

/** 東京駅周辺を想定したサンプル（名称は例） */
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "mock-marunouchi-soba",
    name: "丸の内 かけそば処",
    address: "東京都千代田区丸の内1丁目",
    leafCategoryIds: ["washoku-soba-kake"],
    coordinates: { latitude: 35.6815, longitude: 139.7647 },
  },
  {
    id: "mock-yurakucho-napo",
    name: "有楽町 ナポリタン食堂",
    address: "東京都千代田区有楽町2丁目",
    leafCategoryIds: ["yoshoku-napo-meat"],
    coordinates: { latitude: 35.675, longitude: 139.763 },
  },
  {
    id: "mock-nihonbashi-chuka",
    name: "日本橋 チャーハン楼",
    address: "東京都中央区日本橋",
    leafCategoryIds: ["chuka-chahan"],
    coordinates: { latitude: 35.6844, longitude: 139.7747 },
  },
  {
    id: "mock-shimbashi-sushi",
    name: "新橋 立ち寿司",
    address: "東京都港区新橋2丁目",
    leafCategoryIds: ["washoku-sushi-nigiri"],
    coordinates: { latitude: 35.6664, longitude: 139.758 },
  },
  {
    id: "mock-ginza-cutlet",
    name: "銀座 とんかつ洋食",
    address: "東京都中央区銀座",
    leafCategoryIds: ["yoshoku-tonkatsu-west"],
    coordinates: { latitude: 35.6717, longitude: 139.7649 },
  },
];
