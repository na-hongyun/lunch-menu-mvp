import { searchNearbyRestaurantsWithGooglePlaces } from "@/lib/api/google-places";
import type { GeoCoordinates } from "@/lib/restaurants/types";
import { NextResponse } from "next/server";

function parseNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query")?.trim() ?? "";
  const latitude = parseNumber(searchParams.get("latitude"));
  const longitude = parseNumber(searchParams.get("longitude"));
  const radiusMeters = parseNumber(searchParams.get("radiusMeters"));
  const languageCode = searchParams.get("languageCode")?.trim() || undefined;
  const includedType = searchParams.get("includedType")?.trim() || undefined;
  const limitParsed = parseNumber(searchParams.get("limit"));
  const limit =
    limitParsed !== null ? Math.min(Math.max(Math.floor(limitParsed), 1), 20) : undefined;

  const mapsKey =
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    "";

  console.log("[api/nearby] GET", {
    query: query || "(empty)",
    latitude,
    longitude,
    radiusMeters,
    languageCode: languageCode ?? "(default)",
    includedType: includedType ?? "(none)",
    limit: limit ?? "(default 20)",
    hasMapsApiKey: Boolean(mapsKey),
    keyPreview: mapsKey ? `${mapsKey.slice(0, 4)}…` : null,
  });

  if (!query || latitude === null || longitude === null || radiusMeters === null) {
    console.warn("[api/nearby] 400 missing params");
    return NextResponse.json(
      { message: "query, latitude, longitude, radiusMeters are required" },
      { status: 400 },
    );
  }

  const origin: GeoCoordinates = { latitude, longitude };

  try {
    const restaurants = await searchNearbyRestaurantsWithGooglePlaces({
      query,
      origin,
      radiusMeters,
      languageCode,
      limit,
      includedType,
    });
    console.log("[api/nearby] ok", {
      count: restaurants.length,
      first: restaurants[0]
        ? { id: restaurants[0].id, name: restaurants[0].name }
        : null,
    });
    return NextResponse.json({ restaurants });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[api/nearby] Places error", {
      hasMapsApiKey: Boolean(mapsKey),
      message: msg,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        message: msg || "Failed to search nearby restaurants",
      },
      { status: 502 },
    );
  }
}
