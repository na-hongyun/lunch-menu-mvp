import {
  PLACES_DISTANCE_FILTER_SLACK,
  PLACES_REGION_CODE,
  PLACES_TEXT_LANGUAGE,
} from "@/lib/constants";
import { formatAddressForJapan } from "@/lib/format/address-jp";
import { haversineDistanceMeters } from "@/lib/geo/haversine";
import type { GeoCoordinates, Restaurant } from "@/lib/restaurants/types";

const PLACES_TEXT_SEARCH_URL =
  "https://places.googleapis.com/v1/places:searchText";

interface PlacesTextSearchResponse {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    location?: { latitude?: number; longitude?: number };
    rating?: number;
    userRatingCount?: number;
    types?: string[];
    photos?: Array<{ name?: string }>;
  }>;
}

function getMapsApiKey(): string {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error(
      "Missing GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    );
  }
  return key;
}

export interface SearchNearbyRestaurantsGoogleInput {
  query: string;
  origin: GeoCoordinates;
  radiusMeters: number;
  limit?: number;
  languageCode?: string;
  /** Places Text Search (New) — 단일 타입 필터 (예: restaurant) */
  includedType?: string;
}

/**
 * Places API（New）Text Search · 現在地からの距離でフィルタ。
 * @see https://developers.google.com/maps/documentation/places/web-service/text-search
 */
export async function searchNearbyRestaurantsWithGooglePlaces(
  input: SearchNearbyRestaurantsGoogleInput,
): Promise<Restaurant[]> {
  const apiKey = getMapsApiKey();

  const pageSize = Math.min(Math.max(input.limit ?? 20, 1), 20);
  const languageCode = input.languageCode?.trim() || PLACES_TEXT_LANGUAGE;

  const distanceCeilingMeters = Math.round(
    input.radiusMeters * PLACES_DISTANCE_FILTER_SLACK,
  );

  async function runTextSearch(textQuery: string): Promise<PlacesTextSearchResponse["places"]> {
    const body: Record<string, unknown> = {
      textQuery,
      languageCode,
      regionCode: PLACES_REGION_CODE,
      rankPreference: "DISTANCE",
      locationBias: {
        circle: {
          center: {
            latitude: input.origin.latitude,
            longitude: input.origin.longitude,
          },
          radius: input.radiusMeters,
        },
      },
      pageSize,
    };

    if (input.includedType?.trim()) {
      body.includedType = input.includedType.trim();
    }

    console.log("[google-places] outbound searchText", {
      textQuery,
      languageCode,
      regionCode: body.regionCode,
      includedType: body.includedType ?? null,
      center: input.origin,
      radiusMeters: input.radiusMeters,
      pageSize,
    });

    const res = await fetch(PLACES_TEXT_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.types,places.photos",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      let googleMessage = "";
      try {
        const parsed = JSON.parse(detail) as {
          error?: { message?: string; status?: string };
        };
        googleMessage = parsed.error?.message ?? "";
      } catch {
        /* ignore */
      }

      const placesNewDisabled =
        googleMessage.includes("Places API (New)") &&
        (googleMessage.includes("disabled") ||
          googleMessage.includes("has not been used"));

      if (res.status === 403 && placesNewDisabled) {
        throw new Error(
          "Google Cloud에서 Places API(New)를 켜 주세요. Maps JavaScript API만으로는 텍스트 검색이 되지 않습니다.",
        );
      }

      throw new Error(
        googleMessage
          ? `식당 검색 오류(${res.status}): ${googleMessage}`
          : `식당 검색 오류(${res.status}).`,
      );
    }

    const json = (await res.json()) as PlacesTextSearchResponse;
    return json.places ?? [];
  }

  let items = await runTextSearch(input.query);
  let effectiveTextQuery = input.query;
  if (items.length === 0) {
    const fallback = PLACES_REGION_CODE === "JP" ? "レストラン" : "restaurant";
    console.warn("[google-places] primary textQuery returned 0 places; retrying", {
      primary: input.query,
      fallback,
    });
    items = await runTextSearch(fallback);
    effectiveTextQuery = fallback;
  }

  const mapped: Restaurant[] = [];
  let skippedNoCoordinates = 0;
  let skippedDistance = 0;
  let skippedNoId = 0;

  for (const place of items) {
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    if (lat === undefined || lng === undefined) {
      skippedNoCoordinates += 1;
      continue;
    }

    const coordinates = { latitude: lat, longitude: lng };
    const distanceMeters = Math.round(
      haversineDistanceMeters(input.origin, coordinates),
    );

    if (distanceMeters > distanceCeilingMeters) {
      skippedDistance += 1;
      continue;
    }

    const id = place.id?.trim();
    if (!id) {
      skippedNoId += 1;
      continue;
    }

    const phoneRaw = place.nationalPhoneNumber?.trim();
    const types = Array.isArray(place.types)
      ? place.types.filter((t): t is string => typeof t === "string" && Boolean(t.trim()))
      : undefined;
    const primaryPhotoName = place.photos?.[0]?.name?.trim() || undefined;
    const rating =
      typeof place.rating === "number" && Number.isFinite(place.rating)
        ? place.rating
        : undefined;
    const userRatingCount =
      typeof place.userRatingCount === "number" &&
      Number.isFinite(place.userRatingCount)
        ? place.userRatingCount
        : undefined;

    mapped.push({
      id,
      name: place.displayName?.text?.trim() || "이름 없음",
      address: formatAddressForJapan(place.formattedAddress?.trim() || ""),
      coordinates,
      distanceMeters,
      categoryLabel: undefined,
      phone: phoneRaw || undefined,
      rating,
      userRatingCount,
      placeTypes: types && types.length > 0 ? types : undefined,
      primaryPhotoName,
    });
  }

  console.log("[google-places] searchText summary", {
    primaryQuery: input.query,
    effectiveTextQuery,
    includedType: input.includedType ?? null,
    rawCount: items.length,
    mappedCount: mapped.length,
    skippedNoCoordinates,
    skippedDistance,
    skippedNoId,
    radiusMeters: input.radiusMeters,
    distanceCeilingMeters,
  });

  mapped.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

  return mapped;
}
