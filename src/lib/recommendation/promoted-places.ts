/** Normalize `places/ChIJ…` ↔ `ChIJ…` for weight lookup */
export function stripPlacesResourcePrefix(id: string): string {
  const t = id.trim();
  return t.startsWith("places/") ? t.slice("places/".length) : t;
}

/**
 * `NEXT_PUBLIC_PROMOTED_PLACES` — comma-separated `placeId|weight`.
 * Example: `ChIJxxx|95,ChIJyyy|40`
 */
export function parsePromotedPlaceWeights(raw: string | undefined | null): Map<string, number> {
  const map = new Map<string, number>();
  if (!raw?.trim()) return map;
  for (const segment of raw.split(",")) {
    const [idPart, weightPart] = segment.split("|").map((s) => s.trim());
    if (!idPart || !weightPart) continue;
    const w = Number(weightPart);
    if (!Number.isFinite(w) || w <= 0) continue;
    map.set(stripPlacesResourcePrefix(idPart), w);
  }
  return map;
}

export function promotedWeightForPlaceId(
  placeId: string,
  promoted: ReadonlyMap<string, number>,
): number {
  const key = stripPlacesResourcePrefix(placeId);
  return promoted.get(key) ?? 0;
}
