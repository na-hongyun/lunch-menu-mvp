import type { PlaceReviewSnippet } from "@/lib/reviews/types";
import { sanitizeAsciiApiKey } from "@/lib/env/sanitize-api-key";

function getMapsApiKey(): string {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error(
      "Missing GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    );
  }
  const cleaned = sanitizeAsciiApiKey(key);
  if (!cleaned) {
    throw new Error(
      "GOOGLE_MAPS_API_KEY looks empty after removing non-ASCII characters. Check .env for BOM or invalid characters.",
    );
  }
  return cleaned;
}

/** Places API の resource ID (`places/ChIJ…` または `ChIJ…`) をパス用に正規化 */
export function normalizePlacesPlacePathSegment(placeId: string): string {
  const t = placeId.trim();
  if (t.startsWith("places/")) return t.slice("places/".length);
  return t;
}

interface PlacesReviewRpc {
  text?: { text?: string };
  rating?: number;
}

interface PlaceDetailReviewsJson {
  reviews?: PlacesReviewRpc[];
}

const PLACE_DETAILS_REVALIDATE_SECONDS = 60 * 60 * 24;

/**
 * Place Details（New）からレビュー本文を取得する。
 * @remarks `reviews` は課金 SKU が上位となることがあります（Places Details Enterprise 系）。
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 */
export async function fetchPlaceReviewSnippets(
  placeId: string,
  options?: { limit?: number },
): Promise<PlaceReviewSnippet[]> {
  const apiKey = getMapsApiKey();
  const segment = normalizePlacesPlacePathSegment(placeId);
  if (!segment) return [];

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(segment)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      /** @see https://developers.google.com/maps/documentation/places/web-service/place-details */
      "X-Goog-FieldMask": "reviews",
    },
    cache: "force-cache",
    next: { revalidate: PLACE_DETAILS_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      detail ? `Place Details エラー（${res.status}）：${detail.slice(0, 280)}` : `Place Details エラー（${res.status}）。`,
    );
  }

  const json = (await res.json()) as PlaceDetailReviewsJson;
  const raw = json.reviews ?? [];
  const limit = Math.min(Math.max(options?.limit ?? 12, 1), 15);

  const snippets: PlaceReviewSnippet[] = [];
  for (const r of raw) {
    const text = r.text?.text?.trim();
    if (!text) continue;
    snippets.push({
      text,
      rating: typeof r.rating === "number" ? r.rating : undefined,
    });
    if (snippets.length >= limit) break;
  }

  return snippets;
}
