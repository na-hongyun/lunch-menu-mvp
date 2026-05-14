import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * 키 존재 여부만 반환 (값 노출 없음). `/debug/lunch-data` 용.
 */
export async function GET() {
  const go = process.env.GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const pub = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  const serverNearbyKeyConfigured = Boolean(go || pub);
  const keySource = go ? "GOOGLE_MAPS_API_KEY" : pub ? "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" : "none";

  return NextResponse.json({
    serverNearbyKeyConfigured,
    keySource,
  });
}
