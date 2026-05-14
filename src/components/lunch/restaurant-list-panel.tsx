"use client";

import { useRestaurantMapExplorer } from "@/contexts/restaurant-map-explorer-context";
import { Badge } from "@/components/ui/badge";
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
import type { Restaurant } from "@/lib/restaurants/types";
import { cn } from "@/lib/utils";
import { MapPinned, UtensilsCrossed } from "lucide-react";

export interface RestaurantListPanelProps {
  leafLabel: string | null;
  restaurants: Restaurant[] | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  geoHint: string;
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
                    <button
                      type="button"
                      onClick={() => selectRestaurant(r.id)}
                      aria-pressed={selected}
                      className={cn(
                        "interactive-lift w-full rounded-[1.5rem] border border-white/10 bg-card/70 p-4 text-left shadow-[0_12px_40px_-20px_oklch(0_0_0/0.55)] backdrop-blur-[16px] transition-colors",
                        "hover:border-primary/35 hover:bg-card/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        featured && "sm:p-6",
                        selected &&
                          "border-primary/50 bg-primary/15 ring-2 ring-primary/35",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-2">
                          <p
                            className={cn(
                              "truncate font-bold leading-snug text-foreground",
                              featured ? "text-lg md:text-xl" : "text-[15px] md:text-base",
                            )}
                          >
                            {r.name}
                          </p>
                          <p
                            className={cn(
                              "leading-relaxed text-muted-foreground",
                              featured ? "text-sm md:text-[15px]" : "text-xs md:text-sm",
                            )}
                          >
                            {formatAddressForJapan(r.address)}
                          </p>
                        </div>
                        {typeof r.distanceMeters === "number" && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-primary/30 tabular-nums font-semibold text-primary"
                          >
                            {r.distanceMeters}m
                          </Badge>
                        )}
                      </div>
                    </button>
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
