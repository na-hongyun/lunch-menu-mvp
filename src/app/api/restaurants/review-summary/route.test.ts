import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/restaurants/review-summary/route";
import { server } from "@/test/msw/server";

describe("POST /api/restaurants/review-summary", () => {
  let prevGemini: string | undefined;

  beforeEach(() => {
    prevGemini = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    process.env.GOOGLE_MAPS_API_KEY = "vitest-google-key";
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "vitest-google-key";
  });

  afterEach(() => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (prevGemini !== undefined) {
      process.env.GEMINI_API_KEY = prevGemini;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  it("returns 400 when placeId is missing", async () => {
    const res = await POST(
      new Request("http://localhost:3000/api/restaurants/review-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns no_reviews when Places returns empty reviews", async () => {
    server.use(
      http.get(({ request }) => {
        const u = new URL(request.url);
        return (
          u.hostname === "places.googleapis.com" &&
          /^\/v1\/places\/.+/u.test(u.pathname)
        );
      }, () => HttpResponse.json({ reviews: [] })),
    );

    const res = await POST(
      new Request("http://localhost:3000/api/restaurants/review-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: "places/ChIJmock-no-reviews",
          restaurantName: "テスト店",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("no_reviews");
  });

  it("returns ai_disabled when reviews exist but Gemini key is unset", async () => {
    const res = await POST(
      new Request("http://localhost:3000/api/restaurants/review-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: "places/ChIJmock-ai-disabled",
          restaurantName: "テスト店",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ai_disabled");
  });
});
