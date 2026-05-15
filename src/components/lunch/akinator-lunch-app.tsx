"use client";

import { AkinatorResultCard } from "@/components/lunch/akinator-result-card";
import { MergedMapExplorerProvider } from "@/components/lunch/merged-map-explorer-provider";
import { MyListDrawer, MyListDrawerTrigger } from "@/components/lunch/my-list-drawer";
import { GoogleMapDynamic } from "@/components/map/google-map-dynamic";
import { SavedRestaurantsProvider } from "@/contexts/saved-restaurants-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRestaurantMapExplorer } from "@/contexts/restaurant-map-explorer-context";
import { formatAnswersInFlowOrder, SCENARIOS } from "@/data/akinator-flow";
import { useAkinatorSession } from "@/hooks/use-akinator-session";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useRankedRecommendation } from "@/hooks/use-ranked-recommendation";
import {
  DEFAULT_GEO_FALLBACK,
  NEARBY_RADIUS_CHOICES,
  NEARBY_RADIUS_DEFAULT_M,
} from "@/lib/constants";
import type { GeoCoordinates, Restaurant } from "@/lib/restaurants/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, Compass, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Phase = "wizard" | "reveal" | "results";

type AkinatorResultsRestaurantListProps = {
  ranked: Restaurant[];
  showFallbackHint: boolean;
};

function AkinatorResultsRestaurantList({
  ranked,
  showFallbackHint,
}: AkinatorResultsRestaurantListProps) {
  const { focusRestaurantOnMap } = useRestaurantMapExplorer();
  const [expandedRestaurantId, setExpandedRestaurantId] = useState<string | null>(null);

  const rankIds = useMemo(() => ranked.map((r) => r.id).join("|"), [ranked]);

  useEffect(() => {
    setExpandedRestaurantId(null);
  }, [rankIds]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Current expanded ID:", expandedRestaurantId ?? "null");
    }
  }, [expandedRestaurantId]);

  const handleExpandToggle = useCallback(
    (restaurant: Restaurant) => {
      setExpandedRestaurantId((prev) => {
        const next = prev === restaurant.id ? null : restaurant.id;
        if (next) {
          queueMicrotask(() => focusRestaurantOnMap(next));
        }
        return next;
      });
    },
    [focusRestaurantOnMap],
  );

  return (
    <div className="akinator-results-scroll relative z-[1] isolate flex max-h-[min(70dvh,720px)] min-h-0 flex-col gap-5 overflow-x-visible overflow-y-auto overscroll-y-contain pr-1 !pointer-events-auto [-webkit-overflow-scrolling:touch]">
      {showFallbackHint ? (
        <Card className="border-amber-500/35 bg-amber-500/10 shadow-none">
          <CardContent className="py-4 text-sm leading-relaxed text-foreground">
            완벽히 일치하는 곳은 없지만, 가까운 순·평점·유사 키워드로 골라 본{" "}
            <strong>이런 곳은 어때요?</strong> 아래 상위 {Math.min(3, ranked.length)}
            곳을 먼저 봐 주세요.
          </CardContent>
        </Card>
      ) : null}
      {ranked.slice(0, 5).map((r, i) => (
        <AkinatorResultCard
          key={r.id}
          restaurant={r}
          rank={i + 1}
          featured={i === 0}
          expandedId={expandedRestaurantId}
          onExpandToggle={handleExpandToggle}
          className={cn(
            i === 0 && "animate-stagger-rise",
            showFallbackHint && i < 3 && "ring-1 ring-amber-400/40",
          )}
        />
      ))}
    </div>
  );
}

export function AkinatorLunchApp() {
  const geo = useGeolocation(DEFAULT_GEO_FALLBACK);
  const session = useAkinatorSession();
  const [phase, setPhase] = useState<Phase>("wizard");
  const [revealReady, setRevealReady] = useState(false);
  const [myListOpen, setMyListOpen] = useState(false);
  const [searchRadiusMeters, setSearchRadiusMeters] = useState(NEARBY_RADIUS_DEFAULT_M);

  const coords = geo.coords;
  const awaitingLocation = coords === null;
  /**
   * 위치 pending일 때 임시 폴백 좌표로 먼저 검색하면, 이후 실좌표로 재검색 시
   * 빈 결과가 이전 성공 데이터를 덮어쓸 수 있다.
   * 확정 전에는 null → Places 쿼리 비활성, 확정 후 좌표로 한 번만 검색.
   */
  const searchOrigin = useMemo<GeoCoordinates | null>(() => {
    if (geo.status === "pending") return null;
    return coords ?? DEFAULT_GEO_FALLBACK;
  }, [geo.status, coords]);

  useEffect(() => {
    if (session.hydrated && session.isComplete && phase === "wizard") {
      setPhase("reveal");
      setRevealReady(false);
    }
  }, [session.hydrated, session.isComplete, phase]);

  useEffect(() => {
    if (!session.hydrated) return;
    if (!session.isComplete && (phase === "results" || phase === "reveal")) {
      setPhase("wizard");
      setRevealReady(false);
    }
  }, [session.hydrated, session.isComplete, phase]);

  useEffect(() => {
    if (session.stepIndex === 0 && !session.scenarioId) {
      setPhase("wizard");
      setRevealReady(false);
    }
  }, [session.stepIndex, session.scenarioId]);

  useEffect(() => {
    if (phase !== "reveal") return;
    setRevealReady(false);
    const id = window.setTimeout(() => setRevealReady(true), 1900);
    return () => window.clearTimeout(id);
  }, [phase]);

  /** reveal·results 구간: ranked가 비는 로딩 프레임에도 맵 컨텍스트는 유지 */
  const placesExploreActive =
    session.hydrated &&
    session.isComplete &&
    (phase === "reveal" || phase === "results") &&
    Boolean(session.scenarioId && session.profileTags.length);

  const recommendation = useRankedRecommendation(
    placesExploreActive,
    session.scenarioId,
    session.profileTags,
    searchOrigin,
    searchRadiusMeters,
  );

  useEffect(() => {
    if (phase !== "reveal") return;
    if (!revealReady) return;
    /** Places 응답을 기다리면 네트워크/키 문제 시 영원히 reveal에 갇힘 → 타이머 후 무조건 results */
    if (process.env.NODE_ENV === "development") {
      console.log("[akinator] reveal → results", {
        geoStatus: geo.status,
        recommendationFetched: recommendation.isFetched,
        recommendationStatus: recommendation.status,
      });
    }
    setPhase("results");
  }, [phase, revealReady]);

  /** revealReady 타이머가 깨져도 최대 10초 후에는 결과 화면으로 복구 */
  useEffect(() => {
    if (phase !== "reveal") return;
    const id = window.setTimeout(() => {
      setPhase((p) => (p === "reveal" ? "results" : p));
    }, 10_000);
    return () => window.clearTimeout(id);
  }, [phase]);

  const rankResult = recommendation.data;
  const ranked = useMemo(() => rankResult?.displayList ?? [], [rankResult]);
  const recommendationBusy =
    recommendation.isPending ||
    (ranked.length === 0 && recommendation.isFetching && !recommendation.isError);
  const showFallbackHint = rankResult?.showFallbackHint ?? false;

  const mapBaseCenter = coords ?? DEFAULT_GEO_FALLBACK;

  const geoHint =
    geo.status === "ok"
      ? "정확한 위치"
      : geo.status === "approximate"
        ? "대략적인 위치"
        : geo.status === "pending"
          ? "위치 확인 중…"
          : geo.status === "denied"
            ? "기본 위치(도쿄·新宿)"
            : "위치 확인 중…";

  const progress =
    session.stepIndex === 0
      ? 0
      : session.scenario
        ? session.stepIndex / (session.scenario.questions.length + 1)
        : 0;

  const answersSummary = useMemo(() => {
    if (!session.scenarioId) return "";
    return formatAnswersInFlowOrder(session.scenarioId, session.answers, {
      committedStepIndex: session.stepIndex,
    });
  }, [session.scenarioId, session.answers, session.stepIndex]);

  return (
    <SavedRestaurantsProvider>
      <MergedMapExplorerProvider searchActive={placesExploreActive} nearbyRestaurants={ranked}>
        <div className="stagger-rise-children flex min-h-0 w-full flex-1 flex-col gap-5 xl:grid xl:min-h-0 xl:grid-cols-12 xl:items-stretch xl:gap-6 xl:overflow-hidden">
          <section className="relative z-[40] flex w-full min-w-0 shrink-0 flex-col gap-5 xl:col-span-5 xl:min-h-0 xl:min-w-0 xl:overflow-hidden 2xl:col-span-4">
            {phase === "reveal" ? (
              <Card className="border-primary/30 bg-gradient-to-b from-primary/15 to-transparent shadow-none">
                <CardHeader className="space-y-4">
                  <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                    <Sparkles className="size-7 text-primary" aria-hidden />
                    주변을 살펴보는 중…
                  </CardTitle>
                  <CardDescription className="text-base">
                    질문에 답해 주신 힌트로 가장 어울리는 식당을 골라볼게요.
                  </CardDescription>
                  {answersSummary ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground/90">선택 요약 · </span>
                      {answersSummary}
                    </p>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <div className="akinator-scan-bar overflow-hidden rounded-full bg-white/10">
                    <div className="akinator-scan-bar-inner h-3 rounded-full bg-gradient-to-r from-primary via-accent to-primary" />
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>· Google Places로 실시간 후보를 불러옵니다.</li>
                    <li>
                      · 확정된 현재 위치(또는 도쿄 기준점) 주변 {(searchRadiusMeters / 1000).toFixed(0)}
                      km 안에서 검색한 뒤, 태그로 순위를 매깁니다.
                    </li>
                  </ul>
                  {recommendation.isError ? (
                    <p className="text-sm text-destructive">
                      {recommendation.error instanceof Error
                        ? recommendation.error.message
                        : "검색에 실패했습니다."}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {phase === "wizard" ? (
              session.isComplete ? (
                <Card className="border-primary/20 shadow-none">
                  <CardContent className="flex items-center gap-3 py-8">
                    <Sparkles className="size-8 shrink-0 animate-pulse text-primary" aria-hidden />
                    <p className="text-base font-semibold text-foreground">결과 화면으로 넘어가요…</p>
                  </CardContent>
                </Card>
              ) : (
              <Card className="shadow-none">
                <CardHeader className="space-y-4 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="text-2xl font-black tracking-tight md:text-[1.65rem]">
                      오늘 점심, 제가 맞혀 볼게요
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-primary/40 bg-primary/10 font-medium text-primary"
                    >
                      아키네이터 플로우
                    </Badge>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    한 번에 모든 메뉴를 고르지 않아도 돼요. 상황에 맞는 질문만 차례로
                    드릴게요.
                  </CardDescription>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuenow={Math.round(progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500 ease-out"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </CardHeader>
                <Separator className="bg-white/10" />
                <CardContent className="space-y-6 pt-7">
                  {session.stepIndex === 0 ? (
                    <div className="animate-stagger-rise space-y-4">
                      <p className="text-lg font-bold text-foreground">먼저, 어떤 상황인가요?</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {SCENARIOS.map((s) => (
                          <Button
                            key={s.id}
                            type="button"
                            variant="secondary"
                            size="lg"
                            className="h-auto min-h-[4.5rem] flex-col gap-1 rounded-2xl border border-white/10 bg-secondary/80 py-4 text-left text-base font-bold shadow-none backdrop-blur-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
                            onClick={() => session.selectScenario(s)}
                          >
                            <span className="text-2xl" aria-hidden>
                              {s.icon}
                            </span>
                            <span>{s.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : session.currentQuestion ? (
                    <div key={session.currentQuestion.id} className="animate-stagger-rise space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => session.goBack()}
                        >
                          <ChevronLeft className="size-4" aria-hidden />
                          이전
                        </Button>
                        <Badge variant="outline" className="border-white/15">
                          {session.scenario?.shortLabel}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xl font-black leading-snug tracking-tight md:text-2xl">
                          {session.currentQuestion.prompt}
                        </p>
                        {session.currentQuestion.helper ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {session.currentQuestion.helper}
                          </p>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {session.currentQuestion.options.map((opt) => (
                          <Button
                            key={opt.id}
                            type="button"
                            variant="default"
                            size="lg"
                            className="h-auto min-h-[3.75rem] justify-start rounded-2xl px-5 py-4 text-left text-base font-semibold leading-snug shadow-lg transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
                            onClick={() =>
                              session.answerCurrent(session.currentQuestion!.id, opt.id)
                            }
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
              )
            ) : null}

            {phase === "results" ? (
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-black tracking-tight md:text-2xl">추천 결과</h2>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        session.resetAll();
                        setPhase("wizard");
                      }}
                    >
                      처음부터
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={() => session.goBack()}
                    >
                      마지막 질문 수정
                    </Button>
                  </div>
                </div>
                {answersSummary ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/90">선택 요약 · </span>
                    {answersSummary}
                  </p>
                ) : null}
                {awaitingLocation ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    GPS·IP로 위치가 잡히면 그 좌표로만 검색합니다.
                  </p>
                ) : null}
                {geo.status === "pending" && ranked.length === 0 && !recommendation.isError ? (
                  <p className="text-sm text-muted-foreground">
                    위치를 확인하는 중입니다. 잠시 후 이 주변 식당을 불러옵니다…
                  </p>
                ) : recommendationBusy ? (
                  <p className="text-sm text-muted-foreground">불러오는 중…</p>
                ) : recommendation.isError ? (
                  <p className="text-sm text-destructive">
                    {recommendation.error instanceof Error
                      ? recommendation.error.message
                      : "검색에 실패했습니다."}
                  </p>
                ) : ranked.length === 0 ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    주변에서 식당 데이터가 비어 있어요. 위치·API 키·Places(New) 설정을 확인해 주세요.
                  </p>
                ) : (
                  <AkinatorResultsRestaurantList ranked={ranked} showFallbackHint={showFallbackHint} />
                )}
              </div>
            ) : null}
          </section>

          <section className="relative z-0 flex min-h-[min(52vh,520px)] flex-1 min-w-0 flex-col gap-4 xl:col-span-7 xl:min-h-0 xl:min-w-0 2xl:col-span-8">
            <div className="liquid-glass flex flex-col gap-3 rounded-[1.75rem] px-5 py-4">
              {(phase === "reveal" || phase === "results") && session.isComplete ? (
                <div className="flex flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                  <div className="min-w-0 text-xs leading-relaxed text-muted-foreground sm:max-w-lg">
                    <span className="font-semibold text-foreground/90">현재 위치 기준 검색</span>
                    {" · "}
                    브라우저 Geolocation 또는 IP로 잡힌 좌표를 중심으로 일본 지역 Places를
                    호출합니다. 거부 시 도쿄(新宿) 기준점을 씁니다.
                    {searchOrigin ? (
                      <span className="mt-1 block font-mono text-[11px] text-muted-foreground/90">
                        lat {searchOrigin.latitude.toFixed(5)}, lng{" "}
                        {searchOrigin.longitude.toFixed(5)} · 반경 {(searchRadiusMeters / 1000).toFixed(0)}km
                      </span>
                    ) : (
                      <span className="mt-1 block text-[11px] text-muted-foreground/90">
                        위치 확정 대기 중 — 확정 후 반경 {(searchRadiusMeters / 1000).toFixed(0)}km 로 검색합니다.
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Label htmlFor="ak-radius" className="text-xs font-semibold text-foreground">
                      검색 반경
                    </Label>
                    <Select
                      value={String(searchRadiusMeters)}
                      onValueChange={(v) => {
                        if (!v) return;
                        const n = Number(v);
                        if (Number.isFinite(n)) setSearchRadiusMeters(n);
                      }}
                    >
                      <SelectTrigger id="ak-radius" size="sm" className="h-9 w-[9rem] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NEARBY_RADIUS_CHOICES.map((m) => (
                          <SelectItem key={m} value={String(m)}>
                            {m / 1000} km
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
              <div className="flex items-center gap-2.5 text-base font-bold tracking-tight text-primary">
                <Compass className="size-5 shrink-0 text-accent" aria-hidden />
                지도
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-right">
                  {awaitingLocation
                    ? "위치를 잡는 동안 잠시만 기다려 주세요."
                    : `검색 기준: ${geoHint}`}
                </p>
                <MyListDrawerTrigger open={myListOpen} onOpen={() => setMyListOpen(true)} />
              </div>
              </div>
            </div>

            <GoogleMapDynamic
              baseCenter={mapBaseCenter}
              className="min-h-[min(52vh,560px)] flex-1 lg:min-h-0"
            />

            <MyListDrawer open={myListOpen} onOpenChange={setMyListOpen} />
          </section>
        </div>
      </MergedMapExplorerProvider>
    </SavedRestaurantsProvider>
  );
}
