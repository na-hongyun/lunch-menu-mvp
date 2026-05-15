/**
 * Google / Gemini API keys must be HTTP header–safe (Fetch "ByteString" / Latin-1).
 * UTF-8 BOM (often at the start of a line copied from .env), NBSP, or accidental
 * Korean labels next to the key cause: "Cannot convert argument to a ByteString…".
 *
 * Keeps only printable ASCII (0x20–0x7E), which matches normal Google API key charset.
 */
export function sanitizeAsciiApiKey(raw: string | undefined | null): string {
  if (raw == null) return "";
  const s = String(raw).replace(/\uFEFF/g, "").replace(/\u00A0/g, " ").trim();
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0x20 && c <= 0x7e) {
      out += s[i]!;
    }
  }
  return out;
}
