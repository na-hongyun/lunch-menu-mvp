"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  INFO_MISSING,
  restaurantPrimaryPhoneDisplay,
  restaurantTelHref,
} from "@/lib/restaurants/contact";
import type { Restaurant } from "@/lib/restaurants/types";
import { cn } from "@/lib/utils";
import { Globe, Phone } from "lucide-react";

const disabledMuted = "[&:disabled]:cursor-not-allowed [&:disabled]:grayscale";

export interface RestaurantWebsiteCallButtonsProps {
  restaurant: Restaurant;
  className?: string;
  /** true면 전화 버튼 숨김 (아코디언 상단 별도 전화 CTA 사용 시) */
  hidePhone?: boolean;
}

export function RestaurantWebsiteCallButtons({
  restaurant,
  className,
  hidePhone = false,
}: RestaurantWebsiteCallButtonsProps) {
  const website = restaurant.website?.trim();
  const hasWebsite = Boolean(website);
  const telHref = restaurantTelHref(restaurant);
  const phoneLabel = restaurantPrimaryPhoneDisplay(restaurant);

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={!hasWebsite}
        className={cn(
          "gap-1.5 font-semibold",
          !hasWebsite && "pointer-events-none cursor-not-allowed opacity-30",
          !hasWebsite && disabledMuted,
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (website) window.open(website, "_blank", "noopener,noreferrer");
        }}
      >
        <Globe className="size-3.5 shrink-0" aria-hidden />
        {hasWebsite ? "홈페이지" : "홈페이지 없음"}
      </Button>

      {!hidePhone && telHref ? (
        <a
          href={telHref}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex gap-1.5 font-semibold no-underline",
          )}
        >
          <Phone className="size-3.5 shrink-0" aria-hidden />
          전화 걸기
          <span className="sr-only">{phoneLabel}</span>
        </a>
      ) : !hidePhone ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className={cn("gap-1.5 font-semibold", disabledMuted)}
        >
          <Phone className="size-3.5 shrink-0" aria-hidden />
          전화 · {INFO_MISSING}
        </Button>
      ) : null}
    </div>
  );
}
