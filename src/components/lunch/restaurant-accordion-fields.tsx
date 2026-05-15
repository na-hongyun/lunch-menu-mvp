"use client";

import { RestaurantAccordionAiGuide } from "@/components/lunch/restaurant-accordion-ai-guide";
import { RestaurantWebsiteCallButtons } from "@/components/lunch/restaurant-website-call-buttons";
import { Button, buttonVariants } from "@/components/ui/button";
import { INFO_MISSING, restaurantTelHref } from "@/lib/restaurants/contact";
import type { Restaurant } from "@/lib/restaurants/types";
import { cn } from "@/lib/utils";
import { Check, Clock, Copy, MapPin, Phone } from "lucide-react";
import { useCallback, useState } from "react";

export interface RestaurantAccordionFieldsProps {
  restaurant: Restaurant;
  /** アコーディオンが開いているか（AI クエリ・コピー UI 用） */
  accordionOpen: boolean;
  className?: string;
}

export function RestaurantAccordionFields({
  restaurant,
  accordionOpen,
  className,
}: RestaurantAccordionFieldsProps) {
  const [copied, setCopied] = useState(false);
  const telHref = restaurantTelHref(restaurant);

  const hoursLines = restaurant.openingHoursWeekdayDescriptions;
  const hasHours = Boolean(hoursLines && hoursLines.length > 0);
  const shortAddr = restaurant.shortFormattedAddress?.trim();
  const fullAddress = restaurant.address?.trim() || "";

  const copyAddress = useCallback(async () => {
    const text = fullAddress || INFO_MISSING;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [fullAddress]);

  return (
    <div
      className={cn(
        "space-y-5 text-sm transition-all duration-300 ease-out",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <RestaurantAccordionAiGuide restaurant={restaurant} open={accordionOpen} />

      <div className="space-y-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          주소
        </p>
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-background/30 p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <p className="min-w-0 flex-1 break-keep font-medium leading-relaxed text-foreground [overflow-wrap:anywhere]">
            {fullAddress ? fullAddress : INFO_MISSING}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0 gap-1.5 font-semibold"
            disabled={!fullAddress}
            onClick={(e) => {
              e.stopPropagation();
              void copyAddress();
            }}
            aria-label="주소 복사"
          >
            {copied ? (
              <>
                <Check className="size-3.5" aria-hidden />
                복사됨
              </>
            ) : (
              <>
                <Copy className="size-3.5" aria-hidden />
                복사
              </>
            )}
          </Button>
        </div>
        {shortAddr && shortAddr !== fullAddress ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground/80">간단 표기 · </span>
            {shortAddr}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Phone className="size-3.5 shrink-0" aria-hidden />
          전화
        </p>
        {telHref ? (
          <a
            href={telHref}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "inline-flex h-11 w-full max-w-md items-center justify-center gap-2 font-bold no-underline sm:w-auto sm:min-w-[12rem]",
            )}
          >
            <Phone className="size-4 shrink-0" aria-hidden />
            전화 연결
          </a>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/15 bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
            {INFO_MISSING}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Clock className="size-3.5 shrink-0" aria-hidden />
          영업시간
          {typeof restaurant.openNow === "boolean" ? (
            <span
              className={cn(
                "ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal",
                restaurant.openNow
                  ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-100"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {restaurant.openNow ? "영업 중" : "영업 종료"}
            </span>
          ) : null}
        </p>
        {hasHours ? (
          <ul className="space-y-1.5 break-keep leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
            {hoursLines!.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">{INFO_MISSING}</p>
        )}
      </div>

      <RestaurantWebsiteCallButtons restaurant={restaurant} hidePhone />
    </div>
  );
}
