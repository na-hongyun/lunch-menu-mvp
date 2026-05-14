"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGeolocation } from "@/hooks/use-geolocation";
import { DEFAULT_GEO_FALLBACK, NEARBY_RADIUS_METERS } from "@/lib/constants";
import type { Restaurant } from "@/lib/restaurants/types";
import { useCallback, useEffect, useMemo, useState } from "react";

type Readiness = {
  serverNearbyKeyConfigured: boolean;
  keySource: string;
};

type FetchOutcome =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "done";
      status: number;
      count: number;
      message?: string;
      names: string[];
      requestUrl: string;
    };

const fieldClass =
  "w-full rounded-lg border border-white/15 bg-background/80 px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/60";

function appendLog(prev: string[], line: string, max = 50) {
  const ts = new Date().toISOString().slice(11, 19);
  return [...prev, `[${ts}] ${line}`].slice(-max);
}

export function DebugLunchDataPanel() {
  const geo = useGeolocation(DEFAULT_GEO_FALLBACK);
  const origin = useMemo(() => geo.coords ?? DEFAULT_GEO_FALLBACK, [geo.coords]);

  const clientPublicMapsKey = Boolean(
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim(),
  );

  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [readinessError, setReadinessError] = useState<string | null>(null);

  const [query, setQuery] = useState("restaurant");
  const [lat, setLat] = useState(String(origin.latitude));
  const [lng, setLng] = useState(String(origin.longitude));
  const [radius, setRadius] = useState(String(NEARBY_RADIUS_METERS));
  const [limit, setLimit] = useState("20");
  const [includedType, setIncludedType] = useState("restaurant");
  const [outcome, setOutcome] = useState<FetchOutcome>({ kind: "idle" });
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    setLat(String(origin.latitude));
    setLng(String(origin.longitude));
  }, [origin.latitude, origin.longitude]);

  const loadReadiness = useCallback(async () => {
    setReadinessError(null);
    try {
      const res = await fetch("/api/debug/data-readiness", { cache: "no-store" });
      const body = (await res.json().catch(() => ({}))) as Partial<Readiness>;
      if (!res.ok) {
        setReadinessError(`readiness HTTP ${res.status}`);
        return;
      }
      setReadiness({
        serverNearbyKeyConfigured: Boolean(body.serverNearbyKeyConfigured),
        keySource: typeof body.keySource === "string" ? body.keySource : "unknown",
      });
    } catch (e) {
      setReadinessError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void loadReadiness();
  }, [loadReadiness]);

  const runNearby = useCallback(async () => {
    setOutcome({ kind: "loading" });
    setLines((p) => appendLog(p, "Places 호출 시작…"));

    const la = Number(lat);
    const ln = Number(lng);
    const r = Number(radius);
    const lim = Number(limit);
    if (!query.trim() || !Number.isFinite(la) || !Number.isFinite(ln) || !Number.isFinite(r)) {
      const msg = "query·위도·경도·반경을 숫자로 확인해 주세요.";
      setLines((p) => appendLog(p, msg));
      setOutcome({
        kind: "done",
        status: 0,
        count: 0,
        message: msg,
        names: [],
        requestUrl: "",
      });
      return;
    }

    const params = new URLSearchParams({
      query: query.trim(),
      latitude: String(la),
      longitude: String(ln),
      radiusMeters: String(r),
      languageCode: "ko",
    });
    if (Number.isFinite(lim) && lim > 0) params.set("limit", String(Math.min(20, Math.floor(lim))));
    if (includedType.trim()) params.set("includedType", includedType.trim());

    const requestUrl = `/api/restaurants/nearby?${params.toString()}`;
    setLines((p) => appendLog(p, `GET ${requestUrl}`));

    try {
      const res = await fetch(requestUrl);
      const text = await res.text();
      let body: { restaurants?: Restaurant[]; message?: string };
      try {
        body = JSON.parse(text) as { restaurants?: Restaurant[]; message?: string };
      } catch {
        const msg = `JSON 아님: ${text.slice(0, 200)}`;
        setLines((p) => appendLog(p, msg));
        setOutcome({
          kind: "done",
          status: res.status,
          count: 0,
          message: msg,
          names: [],
          requestUrl,
        });
        return;
      }

      if (!res.ok) {
        const msg = body.message?.trim() || `HTTP ${res.status}`;
        setLines((p) => appendLog(p, `오류: ${msg}`));
        setOutcome({
          kind: "done",
          status: res.status,
          count: 0,
          message: msg,
          names: [],
          requestUrl,
        });
        return;
      }

      const list = body.restaurants ?? [];
      const names = list.slice(0, 8).map((x) => x.name);
      setLines((p) => appendLog(p, `HTTP ${res.status}, 건수=${list.length}`));
      setOutcome({
        kind: "done",
        status: res.status,
        count: list.length,
        names,
        requestUrl,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLines((p) => appendLog(p, `fetch 예외: ${msg}`));
      setOutcome({
        kind: "done",
        status: 0,
        count: 0,
        message: msg,
        names: [],
        requestUrl,
      });
    }
  }, [query, lat, lng, radius, limit, includedType]);

  const dataBanner =
    outcome.kind === "done" ? (
      outcome.count > 0 ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100"
        >
          ✅ Places에서 데이터 <strong>{outcome.count}건</strong>을 받았습니다. 본페이지 추천
          리스트에도 같은 API로 표시될 수 있습니다.
        </div>
      ) : outcome.status === 200 ? (
        <div
          role="status"
          className="rounded-2xl border border-amber-500/40 bg-amber-500/12 px-4 py-3 text-sm text-amber-50"
        >
          ⚠️ HTTP 200이지만 식당 <strong>0건</strong>입니다. 쿼리·반경·좌표(일본 JP 편향 설정 등)를
          바꿔 보세요. 서버 터미널의 <code className="rounded bg-black/30 px-1">[api/nearby]</code>{" "}
          로그도 확인하세요.
        </div>
      ) : (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/45 bg-red-500/12 px-4 py-3 text-sm text-red-100"
        >
          ❌ 데이터를 받지 못했습니다.{" "}
          {outcome.message ? <span className="font-medium">{outcome.message}</span> : null}
          {outcome.status ? ` (HTTP ${outcome.status})` : null}
        </div>
      )
    ) : outcome.kind === "loading" ? (
      <p className="text-sm text-muted-foreground">요청 중…</p>
    ) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-16 text-foreground">
      <div>
        <h1 className="text-2xl font-bold">데이터 수신 디버그</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          아키네이터와 동일하게 <code className="rounded bg-muted px-1">/api/restaurants/nearby</code>
          를 호출합니다. 아래 상태가 초록이면 &quot;데이터가 나온&quot; 것입니다.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-lg">환경 요약</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadReadiness()}>
            다시 확인
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">브라우저(지도용) NEXT_PUBLIC 키:</span>{" "}
            {clientPublicMapsKey ? (
              <span className="text-emerald-300">설정됨</span>
            ) : (
              <span className="text-amber-200">없음 → 지도 타일 안 뜸</span>
            )}
          </p>
          <p>
            <span className="font-medium">서버(식당 API) 키:</span>{" "}
            {readinessError ? (
              <span className="text-destructive">확인 실패: {readinessError}</span>
            ) : readiness ? (
              readiness.serverNearbyKeyConfigured ? (
                <span className="text-emerald-300">
                  설정됨 <span className="text-muted-foreground">({readiness.keySource})</span>
                </span>
              ) : (
                <span className="text-amber-200">
                  없음 → <code className="rounded bg-muted px-1">GOOGLE_MAPS_API_KEY</code> 또는{" "}
                  <code className="rounded bg-muted px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
                </span>
              )
            ) : (
              <span className="text-muted-foreground">불러오는 중…</span>
            )}
          </p>
          <p>
            <span className="font-medium">위치:</span> status={geo.status}, 좌표{" "}
            {origin.latitude.toFixed(5)}, {origin.longitude.toFixed(5)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">수동 Places 호출</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dq">query</Label>
              <input
                id="dq"
                className={fieldClass}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="restaurant"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlat">latitude</Label>
              <input id="dlat" className={fieldClass} value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlng">longitude</Label>
              <input id="dlng" className={fieldClass} value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dr">radiusMeters</Label>
              <input id="dr" className={fieldClass} value={radius} onChange={(e) => setRadius(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dl">limit (1–20)</Label>
              <input id="dl" className={fieldClass} value={limit} onChange={(e) => setLimit(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dit">includedType (비우면 생략)</Label>
              <input
                id="dit"
                className={fieldClass}
                value={includedType}
                onChange={(e) => setIncludedType(e.target.value)}
                placeholder="restaurant"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void runNearby()}>
              호출하기
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setLat(String(origin.latitude));
                setLng(String(origin.longitude));
              }}
            >
              좌표를 현재 위치로
            </Button>
          </div>
          {dataBanner}
          {outcome.kind === "done" && outcome.names.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {outcome.names.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}
          {outcome.kind === "done" && outcome.requestUrl ? (
            <p className="break-all text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">요청:</span> {outcome.requestUrl}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">로그</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-64 overflow-auto rounded-xl bg-muted/50 p-3 text-xs leading-relaxed">
            {lines.length ? lines.join("\n") : "호출하기를 누르면 여기에 쌓입니다."}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
