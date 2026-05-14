export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  /** Places API nationalPhoneNumber など（取得できた場合のみ） */
  phone?: string;
  /** mock 用レガシー。実 API では未使用 */
  leafCategoryIds?: string[];
  coordinates: GeoCoordinates;
  /** リポジトリ側で計算して埋める */
  distanceMeters?: number;
  categoryLabel?: string;
  /** Places API (New) userRatingCount */
  userRatingCount?: number;
  rating?: number;
  /** Place types (e.g. korean_restaurant) */
  placeTypes?: string[];
  /** First photo resource name for Places Photo media API */
  primaryPhotoName?: string;
}

export interface NearbyRestaurantSearchParams {
  searchQuery: string;
  origin: GeoCoordinates;
  radiusMeters: number;
  /** Places Text Search languageCode (default from server constants) */
  languageCode?: string;
}
