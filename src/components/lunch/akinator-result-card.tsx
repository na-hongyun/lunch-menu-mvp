"use client";

import { getPlacePhotoProxyUrl } from "@/lib/api/place-photo-url";
import { RestaurantAccordionFields } from "@/components/lunch/restaurant-accordion-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRestaurantMapExplorer } from "@/contexts/restaurant-map-explorer-context";
import { summarizeRestaurantPlaceKinds } from "@/lib/format/place-types-ko";
import {
  resolveNaverMapSearchUrl,
  resolveRestaurantMapsUrl,
} from "@/lib/restaurants/maps-url";
import type { Restaurant } from "@/lib/restaurants/types";
import { restaurantTelHref } from "@/lib/restaurants/contact";
import { cn } from "@/lib/utils";
import { ChevronDown, ExternalLink, Star } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";

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
  featured?: boolean;
  className?: string;
  expandedId: string | null;
  onExpandToggle: (restaurant: Restaurant) => void;
}

export function AkinatorResultCard({
  restaurant,
  rank,
  featured = false,
  className,
  expandedId,
  onExpandToggle,
}: AkinatorResultCardProps) {
  const isOpen = expandedId === restaurant.id;
  const { selectedRestaurantId } = useRestaurantMapExplorer();
  const mapLinked = selectedRestaurantId === restaurant.id;

  const placeKindLine = summarizeRestaurantPlaceKinds(restaurant);
  const photoUrl = isOpen ? getPlacePhotoProxyUrl(restaurant.primaryPhotoName, 900) : null;
  const [photoFailed, setPhotoFailed] = useState(false);

  const mapsUrl = resolveRestaurantMapsUrl(restaurant);
  const naverUrl = resolveNaverMapSearchUrl(restaurant);

  const toggleId = `restaurant-card-toggle-${restaurant.id}`;
  const panelId = `restaurant-card-panel-${restaurant.id}`;

  useEffect(() => {
    if (!isOpen) setPhotoFailed(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (process.env.NODE_ENV !== "development") return;
    if (!restaurant.address?.trim()) {
      console.warn("Missing data for address", { id: restaurant.id, name: restaurant.name });
    }
    if (!restaurantTelHref(restaurant)) {
      console.warn("Missing data for phone", { id: restaurant.id, name: restaurant.name });
    }
    if (!restaurant.primaryPhotoName?.trim()) {
      console.warn("Missing data for primaryPhotoName", { id: restaurant.id, name: restaurant.name });
    }
  }, [isOpen, restaurant]);

  const handleHeaderClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (process.env.NODE_ENV === "development") {
      console.log("Card clicked:", restaurant.name);
    }
    onExpandToggle(restaurant);
  };

  const showPhoto = Boolean(photoUrl) && !photoFailed;

  return (
    <Card
      className={cn(
        "gap-0 py-0",
        "relative isolate !z-50 !pointer-events-auto transition-[border-color,box-shadow,transform] duration-300 ease-out",
        isOpen
          ? "border border-white/22 shadow-[0_26px_60px_-20px_rgba(0,0,0,0.58),0_0_0_1px_rgba(255,255,255,0.1)]"
          : "border border-white/12 shadow-none",
        "hover:-translate-y-0.5 hover:border-white/18",
        mapLinked &&
          "ring-2 ring-sky-400/85 shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_18px_40px_-12px_oklch(0_0_0/0.35)]",
        featured && !mapLinked && !isOpen && "ring-2 ring-primary/50 animate-result-drum",
        className,
      )}
    >
      <button
        type="button"
        id={toggleId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          "flex w-full cursor-pointer items-start gap-3 rounded-t-[inherit] border-0 bg-transparent p-4 text-left transition-colors sm:p-5",
          "hover:bg-muted/15 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
        onClick={handleHeaderClick}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-0 bg-muted/80 px-2.5 py-0.5 text-[11px] font-black text-foreground">
              TOP {rank}
            </Badge>
            {featured ? (
              <Badge className="border-0 bg-primary/90 px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                오늘의 픽
              </Badge>
            ) : null}
          </div>
          <h3 className="break-keep text-balance text-lg font-black leading-snug tracking-tight text-foreground sm:text-xl">
            {restaurant.name}
          </h3>
          <p className="text-sm font-semibold leading-snug text-accent">
            {placeKindLine || "카테고리 · 미분류"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {typeof restaurant.rating === "number" ? (
              <Stars rating={restaurant.rating} />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">별점 정보 없음</span>
            )}
            {typeof restaurant.userRatingCount === "number" && restaurant.userRatingCount > 0 ? (
              <span className="text-xs text-muted-foreground">
                리뷰 {restaurant.userRatingCount.toLocaleString()}건
              </span>
            ) : null}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 size-6 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={toggleId}
        className={cn(
          "grid min-h-0 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {isOpen ? (
            <div
              className="space-y-4 border-t border-white/10 px-4 pb-5 pt-4 sm:px-5"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/50">
                {showPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl!}
                    alt={restaurant.name}
                    className="size-full object-cover"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                    onError={() => setPhotoFailed(true)}
                  />
                ) : (
                  <div className="flex size-full min-h-[10rem] flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/30 via-muted/40 to-accent/25 px-4 text-center">
                    <span className="text-3xl" aria-hidden>
                      🍽️
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">사진 없음</span>
                  </div>
                )}
              </div>

              <RestaurantAccordionFields restaurant={restaurant} accordionOpen={isOpen} />

              <div className="flex flex-wrap gap-2 pt-1">
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
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden />
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
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
