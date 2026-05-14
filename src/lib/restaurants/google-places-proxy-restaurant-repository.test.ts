import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { GooglePlacesProxyRestaurantRepository } from "./google-places-proxy-restaurant-repository";
import { server } from "@/test/msw/server";

describe("GooglePlacesProxyRestaurantRepository", () => {
  const repo = new GooglePlacesProxyRestaurantRepository();

  it("maps successful JSON into Restaurant rows", async () => {
    const rows = await repo.findNearby({
      searchQuery: "寿司 にぎり ランチ",
      origin: { latitude: 35.681236, longitude: 139.767125 },
      radiusMeters: 1000,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "r-mock-1",
      name: "モックキッチン",
    });
  });

  it("surfaces API error bodies as thrown errors", async () => {
    server.use(
      http.get(
        ({ request }) =>
          new URL(request.url).pathname === "/api/restaurants/nearby",
        () =>
          HttpResponse.json({ message: "Places unavailable" }, { status: 502 }),
      ),
    );

    await expect(
      repo.findNearby({
        searchQuery: "テスト",
        origin: { latitude: 35.681236, longitude: 139.767125 },
        radiusMeters: 1000,
      }),
    ).rejects.toThrow(/Places unavailable/);
  });

  it("throws a fallback message when the response body is empty", async () => {
    server.use(
      http.get(
        ({ request }) =>
          new URL(request.url).pathname === "/api/restaurants/nearby",
        () => new HttpResponse(null, { status: 502 }),
      ),
    );

    await expect(
      repo.findNearby({
        searchQuery: "テスト",
        origin: { latitude: 35.681236, longitude: 139.767125 },
        radiusMeters: 1000,
      }),
    ).rejects.toThrow(/가게 목록을 불러오지 못했습니다 \(502\)/);
  });
});
