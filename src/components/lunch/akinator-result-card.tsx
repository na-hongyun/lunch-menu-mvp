"use client";

import { getPlacePhotoProxyUrl } from "@/lib/api/place-photo-url";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePlaceReviewSummary } from "@/hooks/use-place-review-summary";
import { summarizeRestaurantPlaceKinds } from "@/lib/format/place-types-ko";
import type { Restaurant } from "@/lib/restaurants/types";
import { cn } from "@/lib/utils";
import { MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-1 text-amber-300" aria-label={`별점 ${rating}`}>
      <Star className="size-4 fill-current" aria-hidden />
      <span className="text-sm font-bold tabular-nums text-foreground">{full.toFixed(1)}</span>
    </div>
  );
}

export interface AkinatorResultCardProps {
  restaurant: Restaurant;
  rank: number;
  /** 첫 카드만 AI 리뷰 요약 호출 (API 절약) */
  featured?: boolean;
  className?: string;
}

export function AkinatorResultCard({
  restaurant,
  rank,
  featured = false,
  className,
}: AkinatorResultCardProps) {
  const photoUrl = getPlacePhotoProxyUrl(restaurant.primaryPhotoName, 800);
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(photoUrl) && !photoFailed;

  useEffect(() => {
    setPhotoFailed(false);
  }, [restaurant.id, restaurant.primaryPhotoName]);

  const summary = usePlaceReviewSummary(
    featured ? restaurant.id : null,
    restaurant.name,
  );

  const placeKindLine = summarizeRestaurantPlaceKinds(restaurant);

  return (
    <Card
      className={cn(
        "overflow-hidden border-white/10 bg-card/90 shadow-none backdrop-blur-md transition-[box-shadow,border-color] duration-300 hover:border-white/15 hover:shadow-[0_18px_40px_-12px_oklch(0_0_0/0.35)]",
        featured && "ring-2 ring-primary/50 animate-result-drum",
        className,
      )}
    >
      <div className="relative aspect-[4/3] min-h-[11rem] w-full overflow-hidden bg-muted/40 sm:aspect-[16/9] sm:min-h-[10.5rem]">
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl!}
            alt={restaurant.name}
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-primary/40 via-muted/50 to-accent/35 px-4 text-center">
            <span className="text-4xl drop-shadow-sm" aria-hidden>
              🍽️
            </span>
            <span className="text-xs font-medium text-foreground/75">사진 없음</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-20 sm:pt-16">
          <p className="text-balance text-lg font-black leading-[1.35] tracking-tight text-white drop-shadow-md sm:text-xl sm:leading-[1.4]">
            {restaurant.name}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-white">
            {typeof restaurant.rating === "number" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-amber-300 backdrop-blur-sm">
                <Star className="size-3.5 fill-current" aria-hidden />
                <span className="text-xs font-bold tabular-nums">
                  {(Math.round(restaurant.rating * 2) / 2).toFixed(1)}
                </span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-white/75">별점 없음</span>
            )}
            {typeof restaurant.userRatingCount === "number" && restaurant.userRatingCount > 0 ? (
              <span className="text-[11px] font-medium text-white/80">
                리뷰 {restaurant.userRatingCount.toLocaleString()}건
              </span>
            ) : null}
          </div>
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="border-0 bg-black/55 px-3 py-1 text-xs font-black text-white backdrop-blur-sm">
            TOP {rank}
          </Badge>
          {featured ? (
            <Badge className="border-0 bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground">
              오늘의 픽
            </Badge>
          ) : null}
        </div>
      </div>
      <CardContent className="shrink-0 space-y-3 border-t border-white/10 bg-card/95 p-5 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-balance text-xl font-black leading-snug tracking-tight text-foreground md:text-2xl">
            {restaurant.name}
          </h3>
          {typeof restaurant.rating === "number" ? (
            <Stars rating={restaurant.rating} />
          ) : (
            <span className="text-xs text-muted-foreground">별점 정보 없음</span>
          )}
        </div>
        {placeKindLine ? (
          <p className="text-sm font-semibold leading-snug text-accent">{placeKindLine}</p>
        ) : null}
        <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <span>{restaurant.address}</span>
        </p>
        {restaurant.phone ? (
          <p className="text-sm font-medium tabular-nums text-foreground/90">
            전화{" "}
            <a
              href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
              className="text-primary underline-offset-2 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {restaurant.phone}
            </a>
          </p>
        ) : null}
        {typeof restaurant.distanceMeters === "number" ? (
          <p className="text-xs font-medium text-primary">
            현재 위치에서 약 {restaurant.distanceMeters}m
          </p>
        ) : null}
        {featured ? (
          <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
              리뷰 요약
            </p>
            {summary.isLoading ? (
              <p className="text-sm text-muted-foreground">리뷰를 읽는 중…</p>
            ) : summary.data?.status === "ok" ? (
              <div className="space-y-2">
                <p className="text-base font-bold leading-snug text-foreground">
                  {summary.data.headlineKo}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {summary.data.detailKo}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {summary.data?.status === "no_reviews" ||
                summary.data?.status === "ai_disabled" ||
                summary.data?.status === "summary_unavailable"
                  ? summary.data.message
                  : "요약을 불러오지 못했습니다."}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            상세 요약은 첫 번째 추천 카드에서 확인할 수 있어요.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
