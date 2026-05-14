"use client";

import { useGeolocation } from "@/hooks/use-geolocation";
import { DEFAULT_GEO_FALLBACK } from "@/lib/constants";
import type { Restaurant } from "@/lib/restaurants/types";
import { useEffect, useMemo, useState } from "react";

const RAW_QUERY = "restaurant";
const RAW_RADIUS_M = 5000;
const RAW_LIMIT = 20;

function log(line: string) {
  const msg = `[DebugRawRestaurants] ${line}`;
  console.log(msg);
  return msg;
}

export function DebugRawRestaurants() {
  const geo = useGeolocation(DEFAULT_GEO_FALLBACK);
  const origin = useMemo(
    () => geo.coords ?? DEFAULT_GEO_FALLBACK,
    [geo.coords?.latitude, geo.coords?.longitude],
  );

  const [rows, setRows] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const append = (l: string) => {
      const full = log(l);
      setLines((prev) => [...prev, full].slice(-40));
    };

    let cancelled = false;
    setFetching(true);
    setError(null);

    void (async () => {
      append(`geo.status=${geo.status} origin=${origin.latitude},${origin.longitude}`);
      if (geo.status === "pending" && geo.coords === null) {
        append(
          "위치 pending → 도쿄 기준(DEFAULT_GEO_FALLBACK) 좌표로 검색 (실좌표 오면 자동 재요청)",
        );
      }

      const params = new URLSearchParams({
        query: RAW_QUERY,
        latitude: String(origin.latitude),
        longitude: String(origin.longitude),
        radiusMeters: String(RAW_RADIUS_M),
        limit: String(RAW_LIMIT),
        includedType: "restaurant",
      });

      const url = `/api/restaurants/nearby?${params.toString()}`;
      append(`GET ${url}`);

      try {
        const res = await fetch(url);
        const text = await res.text();
        append(`HTTP ${res.status}, body length=${text.length}`);

        let body: unknown;
        try {
          body = JSON.parse(text) as { restaurants?: Restaurant[]; message?: string };
        } catch {
          const msg = `JSON 파싱 실패 (HTML/프록시 응답일 수 있음): ${text.slice(0, 240)}`;
          append(msg);
          if (!cancelled) setError(msg);
          return;
        }

        if (!res.ok) {
          const msg =
            typeof body === "object" && body && "message" in body
              ? String((body as { message: unknown }).message)
              : text.slice(0, 400);
          append(`API 오류: ${msg}`);
          if (!cancelled) setError(msg);
          return;
        }

        const restaurants = (body as { restaurants?: Restaurant[] }).restaurants ?? [];
        console.log("[DebugRawRestaurants] restaurants (raw array):", restaurants);

        if (restaurants.length === 0) {
          append(
            "restaurants 배열 길이 0 — 서버 터미널의 [google-places] / [api/nearby] 로그에서 rawCount·skipped* 확인",
          );
        } else {
          append(`렌더링 ${restaurants.length}건`);
        }

        if (!cancelled) setRows(restaurants);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        append(`fetch 예외: ${msg}`);
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [origin.latitude, origin.longitude, geo.status, geo.coords]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 text-foreground">
      <div>
        <h1 className="text-2xl font-bold">Emergency debug — Raw Places</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          질문 플로우 없음 · 키워드 필터 없음 · query=&quot;{RAW_QUERY}&quot; · includedType=restaurant ·
          반경 {RAW_RADIUS_M}m · limit {RAW_LIMIT}
        </p>
      </div>

      <section className="rounded-lg border border-white/15 bg-card/50 p-4 text-sm">
        <h2 className="font-semibold">상태</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>geo.status: {geo.status}</li>
          <li>
            검색 원점: {origin.latitude}, {origin.longitude}
          </li>
          <li>fetching: {fetching ? "yes" : "no"}</li>
          <li>rows.length: {rows.length}</li>
          {error ? <li className="text-destructive">error: {error}</li> : null}
        </ul>
      </section>

      <section className="rounded-lg border border-white/15 bg-black/30 p-3">
        <h2 className="mb-2 text-sm font-semibold">로그 (브라우저 콘솔에도 동일 접두사)</h2>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs text-muted-foreground">
          {lines.join("\n")}
        </pre>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">식당 리스트 ({rows.length})</h2>
        {rows.length === 0 && !fetching ? (
          <p className="text-sm text-muted-foreground">
            데이터 없음. 서버 로그: API 키 / Places(New) 활성화 / 위경도 / 매핑(skip) 확인.
          </p>
        ) : (
          <ol className="list-decimal space-y-3 pl-5 text-sm">
            {rows.map((r) => (
              <li key={r.id} className="break-words">
                <div className="font-medium">{r.name}</div>
                <div className="text-muted-foreground">{r.address}</div>
                <div>
                  별점:{" "}
                  {typeof r.rating === "number" ? r.rating.toFixed(1) : "—"}
                  {typeof r.distanceMeters === "number"
                    ? ` · 거리 약 ${r.distanceMeters}m`
                    : null}
                </div>
                <div className="text-xs text-muted-foreground/80">id: {r.id}</div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
