"use client";

import { getPlacePhotoProxyUrl } from "@/lib/api/place-photo-url";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceReviewSummary } from "@/hooks/use-place-review-summary";
import {
  INFO_MISSING,
  restaurantPrimaryPhoneDisplay,
  restaurantTelHref,
} from "@/lib/restaurants/contact";
import {
  resolveNaverMapSearchUrl,
  resolveRestaurantMapsUrl,
} from "@/lib/restaurants/maps-url";
import type { Restaurant } from "@/lib/restaurants/types";
import type {
  ReviewSummaryResponseBody,
  ReviewSummarySuccessBody,
  ReviewSummaryVerdict,
} from "@/lib/reviews/types";
import { cn } from "@/lib/utils";
import { Loader2, Phone, Plus, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

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

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 text-[11px] font-medium leading-snug sm:text-xs",
        v.badgeClass,
      )}
      role="status"
    >
      <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide opacity-85">
        <Sparkles className="size-3 shrink-0" aria-hidden />
        AI 가이드
      </div>
      <p className="font-bold leading-snug text-foreground">{summary.headlineKo}</p>
      <p className="mt-1 line-clamp-3 font-medium leading-relaxed text-foreground/80">
        {summary.detailKo}
      </p>
    </div>
  );
}

/**
 * Google Maps InfoWindow 内 — カスタム HTML 風のモダンシェル（写真・角丸・陰影）。
 */
export function RestaurantInfoWindowContent({
  restaurant,
  onClose,
  onAddToList,
  isAlreadySaved,
}: RestaurantInfoWindowContentProps) {
  const telHref = restaurantTelHref(restaurant);
  const phoneDisplay = restaurantPrimaryPhoneDisplay(restaurant);

  const mapsUrl = resolveRestaurantMapsUrl(restaurant);
  const naverUrl = resolveNaverMapSearchUrl(restaurant);

  const hasWebsite = Boolean(restaurant.website?.trim());

  const summaryQuery = usePlaceReviewSummary(restaurant.id, restaurant.name);
  const summary = summaryQuery.data;

  const photoUrl = getPlacePhotoProxyUrl(restaurant.primaryPhotoName, 480);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [restaurant.id, restaurant.primaryPhotoName]);

  const showPhoto = Boolean(photoUrl) && !photoFailed;

  return (
    <div
      tabIndex={-1}
      className={cn(
        "group/iw max-w-[min(92vw,360px)] text-left font-sans outline-none",
        "p-4 [font-feature-settings:'palt'_1]",
      )}
    >
      <div
        className={cn(
          "relative z-[2] overflow-hidden rounded-[16px] border border-white/12",
          "bg-card/92 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.45),0_2px_12px_-4px_rgba(0,0,0,0.2)]",
          "backdrop-blur-[18px]",
        )}
      >
        <div className="relative h-[7.5rem] w-full overflow-hidden bg-gradient-to-br from-muted/80 to-muted/40">
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl!}
              alt=""
              className="size-full object-cover"
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1 text-white/90">
              <span className="text-3xl drop-shadow" aria-hidden>
                🍽️
              </span>
              <span className="text-[11px] font-semibold tracking-wide">사진 없음</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </div>

        <div className="space-y-3 px-4 pb-4 pt-3">
          <div className="min-h-[4.5rem]">
            {summaryQuery.isPending ? (
              <div className="rounded-xl border border-violet-500/25 bg-violet-500/[0.08] px-3 py-2.5 dark:bg-violet-500/10">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-violet-700/90 dark:text-violet-200/90">
                  <Loader2 className="size-3.5 shrink-0 animate-spin" />
                  AI 가이드
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-[88%] rounded-sm bg-violet-500/20" />
                  <Skeleton className="h-3 w-[72%] rounded-sm bg-violet-500/20" />
                </div>
              </div>
            ) : summaryQuery.isError ? (
              <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11px] leading-snug text-destructive">
                {(summaryQuery.error as Error)?.message ??
                  "AI 요약을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."}
              </p>
            ) : isSummaryOk(summary) ? (
              <AiReviewSummaryBadge summary={summary} />
            ) : summary?.status === "no_reviews" || summary?.status === "ai_disabled" ? (
              <p className="rounded-xl border border-muted bg-muted/40 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
                {summary.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <p
              lang="ja"
              className="break-keep text-[16px] font-bold leading-snug tracking-tight text-foreground [overflow-wrap:anywhere]"
            >
              {restaurant.name}
            </p>
            <p className="text-[10px] font-medium leading-snug text-muted-foreground">
              Google 리뷰를 AI가 요약합니다. 참고용 정보예요.
            </p>
          </div>

          {telHref ? (
            <a
              href={telHref}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "inline-flex h-10 w-full items-center justify-center gap-2 font-bold no-underline",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              전화 연결
              <span className="sr-only">{phoneDisplay}</span>
            </a>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
              {INFO_MISSING}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!hasWebsite}
              className={cn(
                "gap-1.5 font-semibold",
                !hasWebsite && "[&:disabled]:cursor-not-allowed [&:disabled]:grayscale",
              )}
              onClick={(e) => {
                e.stopPropagation();
                const w = restaurant.website?.trim();
                if (w) window.open(w, "_blank", "noopener,noreferrer");
              }}
            >
              {hasWebsite ? "홈페이지" : "홈페이지 없음"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5 font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                window.open(mapsUrl, "_blank", "noopener,noreferrer");
              }}
            >
              Google 지도
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                window.open(naverUrl, "_blank", "noopener,noreferrer");
              }}
            >
              네이버 지도
            </Button>
          </div>

          <div
            className={cn(
              "flex items-center justify-end gap-2 ease-out",
              "transition-opacity duration-300",
              "pointer-events-none opacity-0",
              "group-hover/iw:pointer-events-auto group-hover/iw:opacity-100",
              "group-focus-within/iw:pointer-events-auto group-focus-within/iw:opacity-100",
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
    </div>
  );
}
