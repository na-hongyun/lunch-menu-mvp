"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceReviewSummary } from "@/hooks/use-place-review-summary";
import type { Restaurant } from "@/lib/restaurants/types";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";

export interface RestaurantAccordionAiGuideProps {
  restaurant: Restaurant;
  /** アコーディオンが開いている間だけクエリを有効化（API 節約） */
  open: boolean;
  /** 히어로 이미지 위 오버레이용 (어두운 글래스 톤) */
  variant?: "panel" | "hero";
}

/**
 * 리뷰 AI 요약을 카드 아코디언 안에 3줄 가이드 톤으로 표시.
 */
export function RestaurantAccordionAiGuide({
  restaurant,
  open,
  variant = "panel",
}: RestaurantAccordionAiGuideProps) {
  const q = usePlaceReviewSummary(restaurant.id, restaurant.name, {
    queryEnabled: open,
  });

  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        isHero
          ? "rounded-xl border border-white/18 bg-black/50 p-2.5 shadow-lg backdrop-blur-md"
          : "rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.12] via-card/80 to-fuchsia-500/[0.08] p-4 shadow-inner",
      )}
    >
      <div
        className={cn(
          "mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide",
          isHero ? "text-violet-200/95" : "text-violet-200/90",
        )}
      >
        <Sparkles
          className={cn("shrink-0 text-violet-300", isHero ? "size-3.5" : "size-4")}
          aria-hidden
        />
        AI 가이드
      </div>
      {!open ? (
        <p
          className={cn(
            "text-xs leading-relaxed",
            isHero ? "text-white/75" : "text-muted-foreground",
          )}
        >
          펼치면 이 가게에 맞는 한줄 요약을 불러옵니다.
        </p>
      ) : q.isPending ? (
        <div className="space-y-1.5">
          <div
            className={cn(
              "flex items-center gap-2 text-xs",
              isHero ? "text-white/80" : "text-muted-foreground",
            )}
          >
            <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
            리뷰를 읽는 중…
          </div>
          <Skeleton
            className={cn(
              "h-2.5 w-full max-w-md rounded",
              isHero ? "bg-white/15" : "bg-violet-500/15",
            )}
          />
          <Skeleton
            className={cn(
              "h-2.5 w-[88%] max-w-md rounded",
              isHero ? "bg-white/15" : "bg-violet-500/15",
            )}
          />
        </div>
      ) : q.isError ? (
        <p
          className={cn(
            "text-xs leading-relaxed",
            isHero ? "text-rose-200/95" : "text-muted-foreground",
          )}
        >
          {(q.error as Error)?.message ?? "요약을 불러오지 못했습니다."}
        </p>
      ) : q.data?.status === "ok" ? (
        <div className="space-y-1 font-sans">
          <p
            className={cn(
              "font-bold leading-snug tracking-tight",
              isHero
                ? "text-[13px] text-white drop-shadow-sm sm:text-sm"
                : "text-[15px] text-foreground md:text-base",
            )}
          >
            {q.data.headlineKo}
          </p>
          <p
            className={cn(
              "line-clamp-3 font-medium leading-relaxed",
              isHero
                ? "text-[11px] text-white/88 sm:text-xs"
                : "text-sm text-muted-foreground md:text-[15px] md:leading-relaxed",
            )}
          >
            {q.data.detailKo}
          </p>
        </div>
      ) : q.data?.status === "no_reviews" ||
        q.data?.status === "ai_disabled" ||
        q.data?.status === "summary_unavailable" ? (
        <p
          className={cn(
            "text-xs leading-relaxed",
            isHero ? "text-white/75" : "text-muted-foreground",
          )}
        >
          {q.data.message}
        </p>
      ) : (
        <p
          className={cn(
            "text-xs",
            isHero ? "text-white/70" : "text-muted-foreground",
          )}
        >
          요약 정보가 없습니다.
        </p>
      )}
    </div>
  );
}
