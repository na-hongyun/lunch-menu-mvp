import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/restaurants/nearby/route";
import { server } from "@/test/msw/server";

describe("GET /api/restaurants/nearby", () => {
  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = "vitest-google-key";
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "vitest-google-key";
  });

  afterEach(() => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  });

  it("responds 400 when required params are missing", async () => {
    const res = await GET(new Request("http://localhost:3000/api/restaurants/nearby"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toContain("required");
  });

  it("returns normalized restaurants when Places succeeds (MSW)", async () => {
    const url =
      "http://localhost:3000/api/restaurants/nearby?query=ラーメン&latitude=35.681236&longitude=139.767125&radiusMeters=1000";

    const res = await GET(new Request(url));

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.restaurants)).toBe(true);
    expect(body.restaurants).toHaveLength(1);
    expect(body.restaurants[0]).toMatchObject({
      id: "places/ChIJmock",
      name: "モックテスト店舗",
      phone: "03-1234-5678",
    });
    expect(body.restaurants[0].distanceMeters).toBeGreaterThanOrEqual(0);
  });

  it("responds 502 with a message when Places returns an error", async () => {
    server.use(
      http.post("https://places.googleapis.com/v1/places:searchText", () =>
        HttpResponse.json({ error: { status: "PERMISSION_DENIED" } }, { status: 403 }),
      ),
    );

    const url =
      "http://localhost:3000/api/restaurants/nearby?query=寿司&latitude=35.681236&longitude=139.767125&radiusMeters=1000";

    const res = await GET(new Request(url));

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(typeof body.message).toBe("string");
    expect(body.message.length).toBeGreaterThan(0);
  });

  it("returns an empty list when Places succeeds but has no places", async () => {
    server.use(
      http.post("https://places.googleapis.com/v1/places:searchText", () =>
        HttpResponse.json({ places: [] }),
      ),
    );

    const url =
      "http://localhost:3000/api/restaurants/nearby?query=none&latitude=35.681236&longitude=139.767125&radiusMeters=1000";

    const res = await GET(new Request(url));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.restaurants).toEqual([]);
  });
});
