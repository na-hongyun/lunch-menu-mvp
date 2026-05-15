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
  /**
   * 표시·전화용 번호 (Places `nationalPhoneNumber` 우선, 없으면 `internationalPhoneNumber`).
   * 레거시 Places의 formatted_phone_number 역할.
   */
  formattedPhoneNumber?: string;
  /** Places API `websiteUri` */
  website?: string;
  /** Places `shortFormattedAddress` (가능할 때만) */
  shortFormattedAddress?: string;
  /** Places `currentOpeningHours` 또는 `regularOpeningHours`의 weekdayDescriptions */
  openingHoursWeekdayDescriptions?: string[];
  /** Places 영업시간 객체의 openNow (있을 때만) */
  openNow?: boolean;
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
  /** Places API (New) `googleMapsUri` — 있으면 지도 상세로 바로 연결 */
  mapsUrl?: string;
}

export interface NearbyRestaurantSearchParams {
  searchQuery: string;
  origin: GeoCoordinates;
  radiusMeters: number;
  /** Places Text Search languageCode (default from server constants) */
  languageCode?: string;
}
