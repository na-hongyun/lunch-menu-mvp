import { NextResponse } from "next/server";

const GEOLOCATE_URL = "https://www.googleapis.com/geolocation/v1/geolocate";

function getGeolocationApiKey(): string {
  return (
    process.env.GOOGLE_GEOLOCATION_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    ""
  );
}

/**
 * Google Geolocation API（IP 等のおおよその位置）。
 * 空の JSON を送るとリクエスト元 IP を基準に推定します。
 * @see https://developers.google.com/maps/documentation/geolocation/overview
 */
export async function POST(req: Request) {
  const apiKey = getGeolocationApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          "GOOGLE_GEOLOCATION_API_KEY 또는 GOOGLE_MAPS_API_KEY가 필요합니다.",
      },
      { status: 500 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed = (await req.json()) as Record<string, unknown>;
    if (parsed && typeof parsed === "object") {
      body = parsed;
    }
  } catch {
    body = {};
  }

  const url = `${GEOLOCATE_URL}?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    let hint = text || res.statusText;
    try {
      const err = JSON.parse(text) as { error?: { message?: string } };
      if (err.error?.message) hint = err.error.message;
    } catch {
      /* ignore */
    }
    if (
      res.status === 403 &&
      hint.includes("Geolocation API") &&
      (hint.includes("disabled") || hint.includes("has not been used"))
    ) {
      return NextResponse.json(
        {
          message:
            "Google Cloud에서 Geolocation API를 켜 주세요. Maps 키와는 별도로 라이브러리에서 활성화해야 합니다.",
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { message: `Geolocation failed: ${res.status} ${hint}`.slice(0, 800) },
      { status: 502 },
    );
  }

  let json: {
    location?: { lat?: number; lng?: number };
    accuracy?: number;
  };
  try {
    json = JSON.parse(text) as typeof json;
  } catch {
    return NextResponse.json(
      { message: "Invalid geolocation response" },
      { status: 502 },
    );
  }

  const lat = json.location?.lat;
  const lng = json.location?.lng;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json(
      { message: "Geolocation response missing coordinates" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    latitude: lat,
    longitude: lng,
    accuracy: json.accuracy,
  });
}
