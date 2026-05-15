import { sanitizeAsciiApiKey } from "@/lib/env/sanitize-api-key";

/**
 * Places API (New) Photo media URL.
 * Resource name looks like `places/{placeId}/photos/{ref}` — path slashes must stay
 * unencoded; encoding the whole string as one segment breaks the media endpoint.
 * @see https://developers.google.com/maps/documentation/places/web-service/place-photos
 */
function encodePlacesPhotoPath(photoResourceName: string): string {
  return photoResourceName
    .trim()
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/** 서버·Route Handler에서 사용 (키를 인자로 받음). */
export function buildGooglePlacePhotoMediaRequestUrl(
  photoResourceName: string,
  maxWidthPx: number,
  apiKey: string,
): string | null {
  const name = photoResourceName.trim();
  const key = sanitizeAsciiApiKey(apiKey.trim());
  if (!name || !key) return null;
  const params = new URLSearchParams({
    maxWidthPx: String(maxWidthPx),
    key,
  });
  const path = encodePlacesPhotoPath(name);
  return `https://places.googleapis.com/v1/${path}/media?${params.toString()}`;
}

/**
 * 브라우저에서 직접 Google URL을 쓰지 말고 `/api/places/photo` 경유.
 * (API 키 리퍼러 제한으로 `<img src="https://places.googleapis.com/...">` 가 실패하는 경우가 많음.)
 */
export function getPlacePhotoProxyUrl(
  photoResourceName: string | null | undefined,
  maxWidthPx = 800,
): string | null {
  const name = photoResourceName?.trim();
  if (!name) return null;
  const params = new URLSearchParams({
    name,
    maxWidthPx: String(maxWidthPx),
  });
  return `/api/places/photo?${params.toString()}`;
}

/** 클라이언트 번들에서 `NEXT_PUBLIC` 키로 직접 호출할 때만 (프록시 미사용 시). */
export function buildPlacePhotoMediaUrl(
  photoResourceName: string,
  maxWidthPx = 720,
): string | null {
  const key = sanitizeAsciiApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "");
  return buildGooglePlacePhotoMediaRequestUrl(photoResourceName, maxWidthPx, key);
}
