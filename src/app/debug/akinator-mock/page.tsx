"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collectProfileTags, formatAnswersInFlowOrder } from "@/data/akinator-flow";
import { MOCK_RESTAURANTS_TEN } from "@/data/mock-restaurants-ten";
import { buildPlacesTextQuery } from "@/lib/recommendation/build-search-query";
import {
  buildAkinatorRankOutput,
  tagOnlyScoreForRestaurant,
} from "@/lib/recommendation/rank-restaurants";
import { parsePromotedPlaceWeights } from "@/lib/recommendation/promoted-places";
import Link from "next/link";
import { useMemo, useState } from "react";

type Preset = {
  id: string;
  label: string;
  description: string;
  scenarioId: string;
  answers: Record<string, string>;
};

const PRESETS: Preset[] = [
  {
    id: "date-jp-spicy",
    label:
      "① 데이트 — 점심 → 일식 → 매운맛 OK → 좌식 → 조용 → 예산 보통 → 음료·식사만",
    description:
      "실제 질문 순서(date_meal→cuisine→spicy→seat→vibe→budget→alcohol)와 동일. 태그: scenario_date + cuisine_japanese + spicy_love + floor_seat + quiet + mid_price + alcohol_no",
    scenarioId: "date",
    answers: {
      date_meal: "lunch",
      date_cuisine: "jp",
      date_spicy: "spicy_yes",
      date_seat: "floor",
      date_vibe: "quiet",
      date_budget: "mid",
      date_alcohol: "alc_n",
    },
  },
  {
    id: "office-fast",
    label: "② 회사 점심 — 30분 안쪽 → 일식·돈카츠 → 맵지 않게 → 가볍게",
    description: "off_time→off_cuisine→off_spicy→off_budget",
    scenarioId: "office",
    answers: {
      off_time: "quick",
      off_cuisine: "jp",
      off_spicy: "spicy_no",
      off_budget: "bud",
    },
  },
  {
    id: "solo-noodle",
    label: "③ 혼밥 — 점심 → 국물·면 → 매운 → 빨리 먹고",
    description: "solo_meal→solo_style→solo_spicy→solo_speed",
    scenarioId: "solo",
    answers: {
      solo_meal: "lunch",
      solo_style: "noodle",
      solo_spicy: "yes",
      solo_speed: "quick",
    },
  },
  {
    id: "travel-safe",
    label: "④ 여행 — 점심 → 도보 위주 → 무난한 메뉴 → 순한 맛",
    description: "tr_meal→tr_move→tr_cuisine→tr_spicy",
    scenarioId: "travel",
    answers: {
      tr_meal: "lunch",
      tr_move: "walk",
      tr_cuisine: "safe",
      tr_spicy: "no",
    },
  },
  {
    id: "friends-meat",
    label: "⑤ 친구 모임 — 점심 → 시끌벅적 OK → 고기·구이 → 맵게",
    description: "fr_meal→fr_vibe→fr_cuisine→fr_spicy",
    scenarioId: "friends",
    answers: {
      fr_meal: "lunch",
      fr_vibe: "lively",
      fr_cuisine: "meat",
      fr_spicy: "yes",
    },
  },
];

export default function AkinatorMockDebugPage() {
  const [presetId, setPresetId] = useState<string | null>(null);
  const preset = useMemo(() => PRESETS.find((p) => p.id === presetId) ?? null, [presetId]);

  const promoted = useMemo(
    () => parsePromotedPlaceWeights(process.env.NEXT_PUBLIC_PROMOTED_PLACES),
    [],
  );

  const result = useMemo(() => {
    if (!preset) return null;
    const tags = collectProfileTags(preset.scenarioId, preset.answers);
    const q = buildPlacesTextQuery(preset.scenarioId, tags);
    const rank = buildAkinatorRankOutput(MOCK_RESTAURANTS_TEN, tags, promoted, 10);
    return { tags, q, rank };
  }, [preset, promoted]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-16">
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="text-sm text-primary underline">
          ← 홈
        </Link>
        <Link href="/debug/places" className="text-sm text-primary underline">
          Raw Places
        </Link>
        <Link href="/debug/lunch-data" className="text-sm text-primary underline">
          데이터 디버그
        </Link>
      </div>

      <h1 className="text-2xl font-bold">가상 아키네이터 (API 없음)</h1>
      <p className="text-sm text-muted-foreground">
        아래 버튼만 누르면 <strong>가짜 식당 10곳</strong>에 랭킹을 적용해 바로 리스트가 나와야 합니다. 안
        나오면 브라우저 콘솔 에러를 확인해 주세요.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">프리셋 선택</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {PRESETS.map((p) => (
            <Button
              key={p.id}
              type="button"
              variant={presetId === p.id ? "default" : "secondary"}
              className="h-auto min-h-[3rem] flex-col items-start gap-1 py-3 text-left"
              onClick={() => {
                setPresetId(p.id);
                console.log("[akinator-mock] preset", p.id, p);
              }}
            >
              <span className="font-semibold">{p.label}</span>
              <span className="text-xs font-normal text-muted-foreground">{p.description}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {result ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">계산 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-medium">시나리오:</span> {preset!.scenarioId}
              </p>
              <p>
                <span className="font-medium">태그 ({result.tags.length}):</span>{" "}
                {result.tags.join(", ")}
              </p>
              <p>
                <span className="font-medium">적용 답변 (질문 순·한글 라벨):</span>{" "}
                <span className="break-words text-xs">{formatAnswersInFlowOrder(preset!.scenarioId, preset!.answers)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">디버그 (id):</span>{" "}
                <code className="break-all">
                  {Object.entries(preset!.answers)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(" → ")}
                </code>
              </p>
              <p>
                <span className="font-medium">Places용 쿼리 문자열:</span>{" "}
                <code className="rounded bg-muted px-1">{result.q}</code>
              </p>
              <p>
                <span className="font-medium">폴백 힌트:</span>{" "}
                {result.rank.showFallbackHint ? "예 (태그 강일치 적음)" : "아니오"}
              </p>
              <p>
                <span className="font-medium">strongMatchCount:</span>{" "}
                {result.rank.strongMatchCount}
              </p>
              <p>
                <span className="font-medium">displayList 길이:</span>{" "}
                {result.rank.displayList.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">랭킹 리스트</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-3 pl-5 text-sm">
                {result.rank.displayList.map((r, i) => (
                  <li key={r.id}>
                    <div className="font-medium">
                      {i + 1}. {r.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      tagOnly: {tagOnlyScoreForRestaurant(r, result.tags)} · 별점:{" "}
                      {typeof r.rating === "number" ? r.rating : "—"} · {r.id}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">위에서 하나를 선택해 주세요.</p>
      )}
    </div>
  );
}
