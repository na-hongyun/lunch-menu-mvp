import type { GeoCoordinates } from "@/lib/restaurants/types";

/**
 * 브라우저 위치 거부·타임아웃 시 지도·검색 기준 (도쿄·新宿駅付近).
 * 서울 좌표는 사용하지 않는다.
 */
export const DEFAULT_GEO_FALLBACK: GeoCoordinates = {
  latitude: 35.689634,
  longitude: 139.700638,
};

/** Maps JavaScript API UI 로케일 */
export const MAPS_UI_LANGUAGE = "ko";
/** Maps JS region bias — 일본 기준 */
export const MAPS_UI_REGION = "JP";

/** Places Text Search 응답 언어 (일본 POI 표기) */
export const PLACES_TEXT_LANGUAGE = "ja";

/**
 * Places Text Search regionCode.
 */
export const PLACES_REGION_CODE = "JP";

/**
 * Text Search は bias のみだと関連スコア優先で円外の結果が混じることがある。
 * 表示想定半径よりわずかに広げて取りこぼしを減らす。
 */
export const PLACES_DISTANCE_FILTER_SLACK = 1.35;

/** 현재 위치 기준 검색 반경 후보 (m) — 1km~5km */
export const NEARBY_RADIUS_CHOICES = [1000, 2000, 3000, 4000, 5000] as const;

export const NEARBY_RADIUS_DEFAULT_M = 2000;

/** 하위 호환: 기본값과 동일 */
export const NEARBY_RADIUS_METERS = NEARBY_RADIUS_DEFAULT_M;
