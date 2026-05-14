import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildGooglePlacePhotoMediaRequestUrl,
  buildPlacePhotoMediaUrl,
  getPlacePhotoProxyUrl,
} from "@/lib/api/place-photo-url";

describe("buildGooglePlacePhotoMediaRequestUrl", () => {
  it("keeps slashes between path segments", () => {
    const name = "places/ChIJabc/photos/AWn5SU_xyz";
    const url = buildGooglePlacePhotoMediaRequestUrl(name, 400, "test-key");
    expect(url).toContain("/v1/places/ChIJabc/photos/AWn5SU_xyz/media?");
    expect(url).not.toContain("%2Fplaces%2F");
    expect(url).toContain("maxWidthPx=400");
    expect(url).toContain("key=test-key");
  });
});

describe("getPlacePhotoProxyUrl", () => {
  it("builds same-origin API path with encoded name", () => {
    const u = getPlacePhotoProxyUrl("places/ChIJabc/photos/AWx", 400);
    expect(u).toMatch(/^\/api\/places\/photo\?/);
    expect(u).toContain("maxWidthPx=400");
    expect(u).toContain(encodeURIComponent("places/ChIJabc/photos/AWx"));
  });
});

describe("buildPlacePhotoMediaUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps slashes between path segments (Places photo resource name)", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "test-key");
    const name = "places/ChIJabc/photos/AWn5SU_xyz";
    const url = buildPlacePhotoMediaUrl(name, 400);
    expect(url).toContain("/v1/places/ChIJabc/photos/AWn5SU_xyz/media?");
    expect(url).not.toContain("%2Fplaces%2F");
    expect(url).toContain("maxWidthPx=400");
    expect(url).toContain("key=test-key");
  });

  it("encodes odd characters inside a segment", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "k");
    const url = buildPlacePhotoMediaUrl("places/foo bar/baz", 720);
    expect(url).toContain("places/foo%20bar/baz/media");
  });
});