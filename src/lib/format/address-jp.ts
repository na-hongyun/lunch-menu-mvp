/**
 * Google Places の formatted_address を日本向け表示に軽く整える。
 */
export function formatAddressForJapan(address: string): string {
  const t = address.trim();
  if (!t) return t;
  return t.replace(/\s*,\s*/g, "、").replace(/\s{2,}/g, " ");
}
