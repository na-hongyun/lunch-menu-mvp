import type { IRestaurantRepository } from "@/lib/restaurants/repository";
import { GooglePlacesProxyRestaurantRepository } from "@/lib/restaurants/google-places-proxy-restaurant-repository";

let singleton: IRestaurantRepository | null = null;

export function getRestaurantRepository(): IRestaurantRepository {
  if (!singleton) {
    singleton = new GooglePlacesProxyRestaurantRepository();
  }
  return singleton;
}

/** テストや将来のクライアント差し替え用 */
export function setRestaurantRepository(repo: IRestaurantRepository): void {
  singleton = repo;
}
