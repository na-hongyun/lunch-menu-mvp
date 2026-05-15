"use client";

import { getPlacePhotoProxyUrl } from "@/lib/api/place-photo-url";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlaceReviewSummary } from "@/hooks/use-place-review-summary";
import {
  INFO_MISSING,
  restaurantPrimaryPhoneDisplay,
  restaurantTelHref,
} from "@/lib/restaurants/contact";
import { formatAddressForJapan } from "@/lib/format/address-jp";
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
import { Loader2, MapPin, Phone, Plus, Sparkles, X } from "lucide-react";
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
          "border-emerald-500/40 bg-emerald-500/[0.1] text-emerald-950 dark:border-emerald-400/35 dark:bg-emerald-500/12 dark:text-emerald-50",
      };
    case "mixed":
      return {
        emoji: "🟡",
        labelKo: "AI 판단",
        badgeClass:
          "border-amber-500/40 bg-amber-500/[0.11] text-amber-950 dark:border-amber-400/35 dark:bg-amber-500/12 dark:text-amber-50",
      };
    case "caution":
      return {
        emoji: "🔴",
        labelKo: "AI 경고",
        badgeClass:
          "border-rose-500/40 bg-rose-500/[0.1] text-rose-950 dark:border-rose-400/35 dark:bg-rose-500/12 dark:text-rose-50",
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
        "rounded-2xl border px-3.5 py-2.5 text-[11px] font-medium leading-snug sm:text-xs",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
        v.badgeClass,
      )}
      role="status"
    >
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide opacity-90">
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

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/90">
      {children}
    </p>
  );
}

/**
 * Google Maps InfoWindow 内 — Glassmorphism 패널 (라이트/다크 대응).
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

  const addressLine =
    restaurant.shortFormattedAddress?.trim() ||
    formatAddressForJapan(restaurant.address);
  const hasAddress = Boolean(addressLine.trim());

  useEffect(() => {
    setPhotoFailed(false);
  }, [restaurant.id, restaurant.primaryPhotoName]);

  const showPhoto = Boolean(photoUrl) && !photoFailed;

  return (
    <div
      tabIndex={-1}
      className={cn(
        "max-w-[min(92vw,380px)] text-left font-sans outline-none",
        "p-3 [font-feature-settings:'palt'_1]",
        "animate-restaurant-infowindow-reveal",
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* 바깥 은은한 글래스 (요청: blur 8px) */}
      <div
        className={cn(
          "rounded-[22px] border border-white/15 bg-background/55 p-1 shadow-2xl ring-1 ring-black/5",
          "backdrop-blur-[8px] dark:border-white/12 dark:bg-black/35 dark:ring-white/10",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[20px] border border-neutral-200/60 bg-card/80",
            "shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)]",
            "backdrop-blur-md dark:border-white/10 dark:bg-card/70",
          )}
        >
          <div className="relative h-[8.5rem] w-full overflow-hidden bg-gradient-to-br from-muted/90 to-muted/50">
            {showPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl!}
                alt=""
                className="size-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
                draggable={false}
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                <span className="text-3xl drop-shadow" aria-hidden>
                  🍽️
                </span>
                <span className="text-[11px] font-semibold tracking-wide">사진 없음</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent dark:from-black/70" />
          </div>

          <div className="space-y-4 px-4 pb-4 pt-4">
            {/* AI 섹션 */}
            <section className="space-y-2" aria-labelledby={`iw-ai-${restaurant.id}`}>
              <SectionLabel>AI 추천평</SectionLabel>
              <div id={`iw-ai-${restaurant.id}`} className="min-h-[4.25rem]">
                {summaryQuery.isPending ? (
                  <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.08] px-3.5 py-2.5 dark:bg-violet-500/10">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-violet-700/90 dark:text-violet-200/90">
                      <Loader2 className="size-3.5 shrink-0 animate-spin" />
                      AI 가이드
                    </div>
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-[88%] rounded-full bg-violet-500/20" />
                      <Skeleton className="h-3 w-[72%] rounded-full bg-violet-500/20" />
                    </div>
                  </div>
                ) : summaryQuery.isError ? (
                  <p className="rounded-2xl border border-destructive/25 bg-destructive/5 px-3 py-2 text-[11px] leading-snug text-destructive">
                    {(summaryQuery.error as Error)?.message ??
                      "AI 요약을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."}
                  </p>
                ) : isSummaryOk(summary) ? (
                  <AiReviewSummaryBadge summary={summary} />
                ) : summary?.status === "no_reviews" || summary?.status === "ai_disabled" ? (
                  <p className="rounded-2xl border border-muted-foreground/20 bg-muted/50 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
                    {summary.message}
                  </p>
                ) : null}
              </div>
            </section>

            <Separator className="bg-gradient-to-r from-transparent via-white/15 to-transparent dark:via-white/12" />

            {/* 이름 + 안내 */}
            <section className="space-y-1.5">
              <p
                lang="ja"
                className="break-keep text-[1.05rem] font-extrabold leading-snug tracking-tight text-foreground [overflow-wrap:anywhere] sm:text-[1.15rem]"
              >
                {restaurant.name}
              </p>
              <p className="text-[11px] font-medium leading-relaxed text-muted-foreground sm:text-xs">
                Google 리뷰를 AI가 요약합니다. 참고용 정보예요.
              </p>
            </section>

            {hasAddress ? (
              <>
                <Separator className="bg-gradient-to-r from-transparent via-white/15 to-transparent dark:via-white/12" />
                <section className="space-y-1.5">
                  <SectionLabel>위치</SectionLabel>
                  <div className="flex gap-2.5 rounded-2xl border border-white/12 bg-muted/30 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
                    <MapPin
                      className="mt-0.5 size-4 shrink-0 text-primary/90"
                      aria-hidden
                    />
                    <p className="min-w-0 text-[12px] font-medium leading-relaxed text-foreground/90 [overflow-wrap:anywhere] sm:text-[13px]">
                      {addressLine}
                    </p>
                  </div>
                </section>
              </>
            ) : null}

            <Separator className="bg-gradient-to-r from-transparent via-white/15 to-transparent dark:via-white/12" />

            {/* 전화 */}
            <section className="space-y-2">
              <SectionLabel>연락</SectionLabel>
              {telHref ? (
                <a
                  href={telHref}
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl font-bold no-underline shadow-lg shadow-primary/25",
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="size-4 shrink-0" aria-hidden />
                  전화 연결
                  <span className="sr-only">{phoneDisplay}</span>
                </a>
              ) : (
                <p className="rounded-2xl border border-dashed border-white/15 bg-muted/25 px-3 py-2.5 text-xs text-muted-foreground">
                  {INFO_MISSING}
                </p>
              )}
            </section>

            {/* 링크 버튼 */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!hasWebsite}
                className={cn(
                  "h-9 rounded-full border border-primary/25 px-3.5 font-semibold",
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
                className="h-9 rounded-full px-3.5 font-semibold"
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
                className="h-9 rounded-full border-white/20 bg-background/40 px-3.5 font-semibold backdrop-blur-sm dark:border-white/15 dark:bg-white/[0.04]"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(naverUrl, "_blank", "noopener,noreferrer");
                }}
              >
                네이버 지도
              </Button>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-white/15 to-transparent dark:via-white/12" />

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="size-9 shrink-0 rounded-full border-white/20 bg-background/50 backdrop-blur-sm dark:border-white/15"
                aria-label="정보 창 닫기"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5 rounded-full px-4 font-semibold"
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
    </div>
  );
}
