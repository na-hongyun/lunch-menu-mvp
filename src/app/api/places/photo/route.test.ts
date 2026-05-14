import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/places/photo/route";
import { server } from "@/test/msw/server";

describe("GET /api/places/photo", () => {
  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = "vitest-server-key";
  });

  afterEach(() => {
    delete process.env.GOOGLE_MAPS_API_KEY;
  });

  it("returns 400 when name does not start with places/", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/places/photo?name=evil%2Fpath"),
    );
    expect(res.status).toBe(400);
  });

  it("proxies image bytes from Places media URL", async () => {
    server.use(
      http.get(({ request }) => {
        const u = new URL(request.url);
        return u.hostname === "places.googleapis.com" && u.pathname.endsWith("/media");
      }, () =>
        HttpResponse.arrayBuffer(new Uint8Array([0xff, 0xd8, 0xff]).buffer, {
          headers: { "content-type": "image/jpeg" },
        }),
      ),
    );

    const name = encodeURIComponent("places/ChIJmock/photos/AWmock");
    const res = await GET(
      new NextRequest(`http://localhost/api/places/photo?name=${name}&maxWidthPx=400`),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/jpeg");
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(0);
  });
});
