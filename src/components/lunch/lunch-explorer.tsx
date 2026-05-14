"use client";

import { CategoryStepSelectors } from "@/components/lunch/category-step-selectors";
import { MergedMapExplorerProvider } from "@/components/lunch/merged-map-explorer-provider";
import { MyListDrawer, MyListDrawerTrigger } from "@/components/lunch/my-list-drawer";
import { RestaurantListPanel } from "@/components/lunch/restaurant-list-panel";
import { GoogleMapContainer } from "@/components/map/google-map-container";
import { SavedRestaurantsProvider } from "@/contexts/saved-restaurants-context";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DEFAULT_GEO_FALLBACK,
  NEARBY_RADIUS_METERS,
} from "@/lib/constants";
import type { LunchCategoryTree } from "@/lib/categories/types";
import { useCategorySelection } from "@/hooks/use-category-selection";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useNearbyRestaurants } from "@/hooks/use-nearby-restaurants";
import { Compass } from "lucide-react";
import { useMemo, useState } from "react";

export interface LunchExplorerProps {
  categoryTree: LunchCategoryTree;
}

export function LunchExplorer({ categoryTree }: LunchExplorerProps) {
  const [myListOpen, setMyListOpen] = useState(false);
  const geo = useGeolocation(DEFAULT_GEO_FALLBACK);
  const category = useCategorySelection(categoryTree);

  const resolvedLeaf = useMemo(() => {
    const id = category.resolvedLeafId;
    if (!id) return null;
    return category.leaves.find((l) => l.id === id) ?? null;
  }, [category.leaves, category.resolvedLeafId]);

  const leafLabel = resolvedLeaf?.label ?? null;

  const searchQuery = useMemo(() => {
    if (!resolvedLeaf || !category.resolvedLeafId) return null;

    const majorLabel =
      category.majors.find((m) => m.id === category.selection.majorId)?.label ?? "";
    const midLabel =
      category.mids.find((m) => m.id === category.selection.midId)?.label ?? "";

    const parts = [
      majorLabel,
      midLabel,
      resolvedLeaf.label,
      resolvedLeaf.searchBoost,
      "ランチ",
      "レストラン",
    ].filter((s): s is string => Boolean(s?.trim()));

    return parts.join(" ");
  }, [
    category.majors,
    category.mids,
    category.resolvedLeafId,
    category.selection.majorId,
    category.selection.midId,
    resolvedLeaf,
  ]);

  const searchOrigin = useMemo(() => geo.coords ?? DEFAULT_GEO_FALLBACK, [geo.coords]);

  const nearby = useNearbyRestaurants(searchQuery, searchOrigin, NEARBY_RADIUS_METERS);

  const awaitingLocation = geo.coords === null;
  const searchActive = Boolean(searchQuery);

  const geoHint =
    geo.status === "ok"
      ? "現在地"
      : geo.status === "approximate"
        ? "おおよその位置"
        : geo.status === "pending"
          ? "位置を確認中…"
          : geo.status === "denied"
            ? "既定（東京·新宿付近）"
            : geo.status === "unsupported"
              ? "既定（東京·新宿付近）"
              : "位置を確認中…";

  return (
    <SavedRestaurantsProvider>
      <MergedMapExplorerProvider
        searchActive={searchActive}
        nearbyRestaurants={nearby.data}
      >
      <div className="stagger-rise-children flex min-h-0 w-full flex-1 flex-col gap-5 xl:grid xl:min-h-0 xl:grid-cols-12 xl:grid-rows-[minmax(0,1fr)] xl:items-stretch xl:gap-6 xl:overflow-hidden">
        <section className="flex w-full min-w-0 shrink-0 flex-col gap-5 xl:col-span-5 xl:min-h-0 xl:min-w-0 xl:overflow-hidden 2xl:col-span-4">
          <Card className="shadow-none">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-2xl font-black tracking-tight md:text-[1.65rem]">
                  ランチメニュー検索
                </CardTitle>
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 font-medium text-primary"
                >
                  3ステップ
                </Badge>
              </div>
              <CardDescription>
                カテゴリー → ジャンル → 詳細の順に選ぶと、周辺の店舗が表示されます。
              </CardDescription>
            </CardHeader>
            <Separator className="bg-white/10" />
            <CardContent className="pt-7">
              <CategoryStepSelectors
                majors={category.majors}
                mids={category.mids}
                leaves={category.leaves}
                majorId={category.selection.majorId}
                midId={category.selection.midId}
                leafId={category.selection.leafId}
                onMajorChange={category.setMajorId}
                onMidChange={category.setMidId}
                onLeafChange={category.setLeafId}
              />
            </CardContent>
          </Card>

          <div className="flex min-h-0 flex-col lg:flex-1 lg:min-h-0">
            <RestaurantListPanel
              leafLabel={leafLabel}
              restaurants={searchActive ? nearby.data : undefined}
              isLoading={
                (!!leafLabel && awaitingLocation) ||
                (nearby.isEnabled && nearby.isLoading)
              }
              isError={nearby.isEnabled && nearby.isError}
              errorMessage={
                nearby.isEnabled && nearby.error instanceof Error
                  ? nearby.error.message
                  : null
              }
              geoHint={geoHint}
            />
          </div>
        </section>

        <section className="relative flex min-h-[min(52vh,520px)] flex-1 min-w-0 flex-col gap-4 xl:col-span-7 xl:min-h-0 xl:min-w-0 2xl:col-span-8">
          <div className="liquid-glass flex flex-col gap-3 rounded-[1.75rem] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-4">
            <div className="flex items-center gap-2.5 text-base font-bold tracking-tight text-primary">
              <Compass className="size-5 shrink-0 text-accent" aria-hidden />
              Google マップ
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-right">
                リストまたはピンで詳細を開き、ホバーで閉じる・リスト追加。保存があると「マイリスト」から一覧を開けます。
              </p>
              <MyListDrawerTrigger open={myListOpen} onOpen={() => setMyListOpen(true)} />
            </div>
          </div>

          <GoogleMapContainer
            baseCenter={searchOrigin}
            className="min-h-[min(52vh,560px)] flex-1 lg:min-h-0"
          />

          <MyListDrawer open={myListOpen} onOpenChange={setMyListOpen} />
        </section>
      </div>
      </MergedMapExplorerProvider>
    </SavedRestaurantsProvider>
  );
}
