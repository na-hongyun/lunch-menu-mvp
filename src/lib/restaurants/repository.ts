import type { NearbyRestaurantSearchParams, Restaurant } from "@/lib/restaurants/types";

/**
 * 店舗検索の抽象。
 * Mock と Google Places など実装だけ差し替える。
 */
export interface IRestaurantRepository {
  findNearby(params: NearbyRestaurantSearchParams): Promise<Restaurant[]>;
}
