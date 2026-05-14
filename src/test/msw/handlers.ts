import { http, HttpResponse } from "msw";

const TOKYO_LAT = 35.681236;
const TOKYO_LNG = 139.767125;

const isNearbyPath = (request: Request) =>
  new URL(request.url).pathname === "/api/restaurants/nearby";

/** Places API (New) Text Search — Route Handler 経由で叩くモック */
export function placesSearchSuccessHandler() {
  return http.post("https://places.googleapis.com/v1/places:searchText", () => {
    return HttpResponse.json({
      places: [
        {
          id: "places/ChIJmock",
          displayName: { text: "モックテスト店舗" },
          formattedAddress: "東京都千代田区丸の内1丁目",
          nationalPhoneNumber: "03-1234-5678",
          location: { latitude: TOKYO_LAT, longitude: TOKYO_LNG },
        },
      ],
    });
  });
}

/** Place Details（レビュー取得）— サーバー側 fetch 用 MSW */
export function placesPlaceDetailsReviewsHandler() {
  return http.get(({ request }) => {
    const u = new URL(request.url);
    return (
      u.hostname === "places.googleapis.com" && /^\/v1\/places\/.+/u.test(u.pathname)
    );
  }, () => {
    return HttpResponse.json({
      reviews: [
        {
          rating: 5,
          text: {
            text: "ランチのコスパが良く、味も安定しています。リピートしています。",
            languageCode: "ja",
          },
        },
        {
          rating: 3,
          text: {
            text: "ピーク時は席が狭く感じることもあり、待ち時間は覚悟が必要です。",
            languageCode: "ja",
          },
        },
      ],
    });
  });
}

/** ブラウザ → Next API Route（nearby プロキシ） */
export function nearbyRouteProxySuccessHandler() {
  return http.get(({ request }) => isNearbyPath(request), ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim();
    const lat = url.searchParams.get("latitude");
    const lng = url.searchParams.get("longitude");
    const radius = url.searchParams.get("radiusMeters");

    if (!query || lat === null || lng === null || radius === null) {
      return HttpResponse.json(
        { message: "query, latitude, longitude, radiusMeters are required" },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      restaurants: [
        {
          id: "r-mock-1",
          name: "モックキッチン",
          address: "東京都千代田区丸の内",
          coordinates: { latitude: TOKYO_LAT, longitude: TOKYO_LNG },
          distanceMeters: 120,
          phone: "03-1234-5678",
        },
      ],
    });
  });
}

export const handlers = [
  placesSearchSuccessHandler(),
  placesPlaceDetailsReviewsHandler(),
  nearbyRouteProxySuccessHandler(),
];
