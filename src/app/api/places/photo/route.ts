import { buildGooglePlacePhotoMediaRequestUrl } from "@/lib/api/place-photo-url";
import { sanitizeAsciiApiKey } from "@/lib/env/sanitize-api-key";
import { type NextRequest, NextResponse } from "next/server";

const MAX_NAME_LEN = 512;

function clampMaxWidthPx(raw: string | null): number {
  const n = Number(raw ?? "800");
  if (!Number.isFinite(n)) return 800;
  return Math.min(Math.max(Math.floor(n), 1), 4800);
}

/**
 * 브라우저에서 Google Photo media URL을 직접 열면
 * API 키의 HTTP 리퍼러 제한 등으로 `<img>` 로드가 실패하는 경우가 많다.
 * 서버 키로 원본을 받아 동일 출처로 내려준다.
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/place-photos
 */
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim() ?? "";
  const maxWidthPx = clampMaxWidthPx(req.nextUrl.searchParams.get("maxWidthPx"));

  if (!name.startsWith("places/") || name.length > MAX_NAME_LEN) {
    return new NextResponse(null, { status: 400 });
  }

  const apiKey = sanitizeAsciiApiKey(
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
      "",
  );

  if (!apiKey) {
    return new NextResponse(null, { status: 503 });
  }

  const upstream = buildGooglePlacePhotoMediaRequestUrl(name, maxWidthPx, apiKey);
  if (!upstream) {
    return new NextResponse(null, { status: 400 });
  }

  const upstreamRes = await fetch(upstream, {
    headers: { Accept: "image/*,*/*" },
    redirect: "follow",
    cache: "no-store",
  });

  if (!upstreamRes.ok) {
    const status = upstreamRes.status === 404 ? 404 : 502;
    return new NextResponse(null, { status });
  }

  const contentType = upstreamRes.headers.get("content-type") ?? "image/jpeg";
  const body = upstreamRes.body;
  if (!body) {
    const buf = await upstreamRes.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400, s-maxage=86400",
      },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
