import { NextResponse } from "next/server";
import { sanitizeAsciiApiKey } from "@/lib/env/sanitize-api-key";

export const dynamic = "force-dynamic";

/**
 * 키 존재 여부만 반환 (값 노출 없음). `/debug/lunch-data` 용.
 */
export async function GET() {
  const go = sanitizeAsciiApiKey(process.env.GOOGLE_MAPS_API_KEY ?? "");
  const pub = sanitizeAsciiApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "");
  const serverNearbyKeyConfigured = Boolean(go || pub);
  const keySource = go ? "GOOGLE_MAPS_API_KEY" : pub ? "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" : "none";

  return NextResponse.json({
    serverNearbyKeyConfigured,
    keySource,
  });
}
