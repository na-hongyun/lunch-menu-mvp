"use client";

import { RestaurantAccordionFields } from "@/components/lunch/restaurant-accordion-fields";
import { useRestaurantMapExplorer } from "@/contexts/restaurant-map-explorer-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAddressForJapan } from "@/lib/format/address-jp";
import {
  resolveNaverMapSearchUrl,
  resolveRestaurantMapsUrl,
} from "@/lib/restaurants/maps-url";
import type { Restaurant } from "@/lib/restaurants/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ExternalLink, MapPinned, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";

export interface RestaurantListPanelProps {
  leafLabel: string | null;
  restaurants: Restaurant[] | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  geoHint: string;
}

function RestaurantListRow({
  restaurant: r,
  featured,
  selected,
  onSelect,
}: {
  restaurant: Restaurant;
  featured: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const { focusRestaurantOnMap } = useRestaurantMapExplorer();
  const [isOpen, setIsOpen] = useState(false);
  const mapsUrl = resolveRestaurantMapsUrl(r);
  const naverUrl = resolveNaverMapSearchUrl(r);
  const toggleId = `list-row-toggle-${r.id}`;
  const panelId = `list-row-panel-${r.id}`;

  useEffect(() => {
    setIsOpen(false);
  }, [r.id]);

  return (
    <div
      className={cn(
        "interactive-lift relative isolate !z-50 !pointer-events-auto overflow-hidden rounded-[1.5rem] border border-white/10 bg-card/70 shadow-[0_12px_40px_-20px_oklch(0_0_0/0.55)] backdrop-blur-[16px] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:cursor-pointer hover:bg-card/90",
        selected &&
          "border-sky-400/45 bg-sky-500/10 ring-2 ring-sky-400/55 shadow-[0_0_0_1px_rgba(56,189,248,0.25)]",
      )}
    >
      <button
        type="button"
        id={toggleId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-pressed={selected}
        onClick={() => {
          if (!selected) {
            onSelect(r.id);
          }
          setIsOpen((v) => {
            const next = !v;
            if (next) {
              queueMicrotask(() => focusRestaurantOnMap(r.id));
            }
            return next;
          });
        }}
        className={cn(
          "flex w-full cursor-pointer items-start gap-3 p-4 text-left transition-colors hover:bg-card/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          featured && "sm:p-6",
        )}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <p
            className={cn(
              "break-keep font-bold leading-snug text-foreground [overflow-wrap:anywhere]",
              featured ? "text-lg md:text-xl" : "text-[15px] md:text-base",
            )}
          >
            {r.name}
          </p>
          <p
            className={cn(
              "break-keep leading-relaxed text-muted-foreground [overflow-wrap:anywhere]",
              featured ? "text-sm md:text-[15px]" : "text-xs md:text-sm",
            )}
          >
            {formatAddressForJapan(r.address)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {typeof r.distanceMeters === "number" ? (
            <Badge
              variant="outline"
              className="border-primary/30 tabular-nums font-semibold text-primary"
            >
              {r.distanceMeters}m
            </Badge>
          ) : null}
          <ChevronDown
            className={cn(
              "size-5 text-muted-foreground transition-transform duration-300",
              isOpen && "rotate-180",
            )}
            aria-hidden
          />
        </div>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={toggleId}
        className={cn(
          "grid min-h-0 border-t border-white/10 transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden transition-all duration-300 ease-out">
          <div className="space-y-4 px-4 pb-4 pt-3 sm:px-6 sm:pb-5">
            <RestaurantAccordionFields restaurant={r} accordionOpen={isOpen} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3 sm:px-6">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5 font-semibold"
          onClick={() => {
            onSelect(r.id);
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
          onClick={() => {
            onSelect(r.id);
            window.open(naverUrl, "_blank", "noopener,noreferrer");
          }}
        >
          네이버 지도
        </Button>
      </div>
    </div>
  );
}

export function RestaurantListPanel({
  leafLabel,
  restaurants,
  isLoading,
  isError,
  errorMessage,
  geoHint,
}: RestaurantListPanelProps) {
  const { selectedRestaurantId, selectRestaurant } = useRestaurantMapExplorer();

  const empty =
    !isLoading &&
    !isError &&
    leafLabel &&
    restaurants &&
    restaurants.length === 0;

  return (
    <Card className="flex min-h-0 flex-1 flex-col shadow-none">
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <CardTitle className="flex items-center gap-2.5 text-xl font-black tracking-tight md:text-2xl">
              <UtensilsCrossed className="size-6 shrink-0 text-accent" />
              周辺のお店
            </CardTitle>
            <CardDescription>
              {leafLabel
                ? `選択：${leafLabel} · 約1km圏内`
                : "詳細まで選択すると一覧が表示されます。"}
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="shrink-0 gap-1.5 border border-white/10 bg-secondary/80 px-3 py-1.5 text-xs font-semibold backdrop-blur-md"
          >
            <MapPinned className="size-3.5 text-primary" aria-hidden />
            {geoHint}
          </Badge>
        </div>
      </CardHeader>
      <Separator className="bg-white/10" />
      <CardContent className="flex min-h-0 flex-1 flex-col pt-7 lg:overflow-hidden">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 rounded-3xl sm:col-span-2" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
          </div>
        )}

        {isError && (
          <div className="space-y-3">
            <p className="text-sm font-medium leading-snug text-destructive">
              お店の一覧を読み込めませんでした。
            </p>
            {errorMessage ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {errorMessage}
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                しばらくしてから再度お試しください。
              </p>
            )}
          </div>
        )}

        {empty && (
          <p className="text-base leading-relaxed text-muted-foreground">
            この条件のお店が約1km圏内に見つかりませんでした。詳細やエリアを変えてお試しください。
          </p>
        )}

        {!isLoading && !isError && restaurants && restaurants.length > 0 && (
          <ScrollArea className="h-[min(52vh,520px)] min-h-[200px] pr-3 lg:h-full lg:min-h-0 lg:flex-1">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {restaurants.map((r, index) => {
                const selected = r.id === selectedRestaurantId;
                const featured = index === 0;
                return (
                  <li
                    key={r.id}
                    className={cn(featured && "sm:col-span-2")}
                  >
                    <RestaurantListRow
                      restaurant={r}
                      featured={featured}
                      selected={selected}
                      onSelect={selectRestaurant}
                    />
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
