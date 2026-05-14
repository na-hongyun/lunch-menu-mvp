"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceReviewSummary } from "@/hooks/use-place-review-summary";
import type { Restaurant } from "@/lib/restaurants/types";
import type {
  ReviewSummaryResponseBody,
  ReviewSummarySuccessBody,
  ReviewSummaryVerdict,
} from "@/lib/reviews/types";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Sparkles, X } from "lucide-react";

export interface RestaurantInfoWindowContentProps {
  restaurant: Restaurant;
  onClose: () => void;
  onAddToList: () => void;
  isAlreadySaved: boolean;
}

function verdictPresentation(verdict: ReviewSummaryVerdict): {
  emoji: string;
  labelKo: string;
  badgeClass: string;
} {
  switch (verdict) {
    case "strong_positive":
      return {
        emoji: "🟢",
        labelKo: "AI 추천",
        badgeClass:
          "border-emerald-500/45 bg-emerald-500/[0.12] text-emerald-950 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-50",
      };
    case "mixed":
      return {
        emoji: "🟡",
        labelKo: "AI 판단",
        badgeClass:
          "border-amber-500/45 bg-amber-500/[0.14] text-amber-950 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-50",
      };
    case "caution":
      return {
        emoji: "🔴",
        labelKo: "AI 경고",
        badgeClass:
          "border-rose-500/45 bg-rose-500/[0.12] text-rose-950 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-50",
      };
  }
}

function isSummaryOk(
  data: ReviewSummaryResponseBody | undefined,
): data is ReviewSummarySuccessBody {
  return data?.status === "ok";
}

function AiReviewSummaryBadge({ summary }: { summary: ReviewSummarySuccessBody }) {
  const v = verdictPresentation(summary.verdict);
  const line = `${v.emoji} ${v.labelKo}: ${summary.headlineKo} (${summary.detailKo})`;

  return (
    <div
      className={cn(
        "rounded-lg border px-2.5 py-2 text-[11px] font-medium leading-snug sm:text-xs",
        v.badgeClass,
      )}
      role="status"
    >
      <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
        <Sparkles className="size-3 shrink-0" aria-hidden />
        AI 리뷰 요약
      </div>
      <p className="font-semibold leading-snug">{line}</p>
    </div>
  );
}

/**
 * Google Maps InfoWindow 内コンテンツ。
 * 広い透明パディングでホバー領域を拡張し、操作ボタンはホバー／フォーカス時のみ表示。
 */
export function RestaurantInfoWindowContent({
  restaurant,
  onClose,
  onAddToList,
  isAlreadySaved,
}: RestaurantInfoWindowContentProps) {
  const telHref = restaurant.phone?.replace(/\s/g, "");

  const summaryQuery = usePlaceReviewSummary(restaurant.id, restaurant.name);
  const summary = summaryQuery.data;

  return (
    <div
      tabIndex={-1}
      className={cn(
        "group/iw max-w-[340px] rounded-[1.5rem] text-left outline-none",
        /** 見えないパディングでホバー安定化（マップとの隙間でもグループを維持しやすくする） */
        "p-5",
      )}
    >
      <div className="rounded-[1.35rem] border border-white/10 bg-card/80 px-4 py-3 shadow-[0_20px_50px_-24px_oklch(0_0_0/0.55)] backdrop-blur-[16px]">
        {/* AI 一行評 */}
        <div className="mb-2.5 min-h-[3.25rem]">
          {summaryQuery.isPending ? (
            <div className="rounded-lg border border-violet-500/25 bg-violet-500/[0.08] px-2.5 py-2 dark:bg-violet-500/10">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-violet-700/90 dark:text-violet-200/90">
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
                AI 리뷰 요약
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-[88%] rounded-sm bg-violet-500/20" />
                <Skeleton className="h-3 w-[72%] rounded-sm bg-violet-500/20" />
              </div>
            </div>
          ) : summaryQuery.isError ? (
            <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-2.5 py-2 text-[11px] leading-snug text-destructive">
              {(summaryQuery.error as Error)?.message ??
                "AI 요약을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."}
            </p>
          ) : isSummaryOk(summary) ? (
            <AiReviewSummaryBadge summary={summary} />
          ) : summary?.status === "no_reviews" || summary?.status === "ai_disabled" ? (
            <p className="rounded-lg border border-muted bg-muted/40 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
              {summary.message}
            </p>
          ) : null}
        </div>

        <p className="text-[15px] font-semibold leading-snug text-foreground">
          {restaurant.name}
        </p>
        {restaurant.phone ? (
          <a
            href={telHref ? `tel:${telHref}` : undefined}
            className="mt-1 block text-sm font-semibold text-primary underline-offset-2 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {restaurant.phone}
          </a>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">전화번호 없음</p>
        )}

        <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
          Google 리뷰를 AI가 요약합니다. 참고용 정보예요.
        </p>

        <div
          className={cn(
            "mt-3 flex items-center justify-end gap-2 ease-out",
            "transition-opacity duration-300",
            "opacity-0 pointer-events-none",
            "group-hover/iw:opacity-100 group-hover/iw:pointer-events-auto",
            "group-focus-within/iw:opacity-100 group-focus-within/iw:pointer-events-auto",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-7 shrink-0"
            aria-label="정보 창 닫기"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="size-3.5" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1"
            disabled={isAlreadySaved}
            onClick={(e) => {
              e.stopPropagation();
              onAddToList();
            }}
          >
            <Plus className="size-3.5" aria-hidden />
            {isAlreadySaved ? "추가됨" : "내 리스트에 추가"}
          </Button>
        </div>
      </div>
    </div>
  );
}
