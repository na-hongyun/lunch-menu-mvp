"use client";

import { useRestaurantMapExplorer } from "@/contexts/restaurant-map-explorer-context";
import { useSavedRestaurants } from "@/contexts/saved-restaurants-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatAddressForJapan } from "@/lib/format/address-jp";
import { cn } from "@/lib/utils";
import { Bookmark, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface MyListDrawerTriggerProps {
  open: boolean;
  onOpen: () => void;
  className?: string;
}

/** 저장된 항목이 있을 때만 표시 (지도 툴바). */
export function MyListDrawerTrigger({
  open,
  onOpen,
  className,
}: MyListDrawerTriggerProps) {
  const { savedRestaurants } = useSavedRestaurants();
  if (savedRestaurants.length === 0) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className={cn("shrink-0 gap-2 shadow-sm", className)}
      onClick={onOpen}
      aria-expanded={open}
      aria-controls="my-list-drawer-panel"
    >
      <Bookmark className="size-4 text-muted-foreground" aria-hidden />
      <span className="hidden sm:inline">내 리스트</span>
      <Badge variant="outline" className="tabular-nums font-normal">
        {savedRestaurants.length}
      </Badge>
    </Button>
  );
}

export interface MyListDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 지도 위 오버레이 리스트. 저장된 식당이 있을 때만 사용.
 */
export function MyListDrawer({ open, onOpenChange }: MyListDrawerProps) {
  const { savedRestaurants, removeSavedRestaurant } = useSavedRestaurants();
  const { selectedRestaurantId, selectRestaurant } = useRestaurantMapExplorer();
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- createPortal は document 依存のため CSR でのみマウント */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (savedRestaurants.length === 0 && open) {
      onOpenChange(false);
    }
  }, [savedRestaurants.length, open, onOpenChange]);

  if (!mounted || savedRestaurants.length === 0) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {/* backdrop */}
      <button
        type="button"
        aria-label="내 리스트 닫기"
        className={cn(
          "pointer-events-auto absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* panel */}
      <div
        id="my-list-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-list-drawer-title"
        className={cn(
          "absolute right-0 top-0 flex h-full max-h-[100dvh] w-full max-w-md flex-col border-l border-white/10 bg-background/75 shadow-[0_0_80px_-20px_oklch(0_0_0/0.75)] backdrop-blur-[16px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "pointer-events-auto translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-5">
          <div className="min-w-0 space-y-2">
            <CardTitle
              id="my-list-drawer-title"
              className="flex flex-wrap items-center gap-2 text-xl font-black tracking-tight"
            >
              <Bookmark className="size-6 shrink-0 text-accent" aria-hidden />
              내 리스트
              <Badge variant="secondary" className="tabular-nums font-normal">
                {savedRestaurants.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              지도 정보창에서 추가한 식당이에요. 삭제해도 검색 결과는 그대로예요.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-9 shrink-0"
            aria-label="닫기"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
        <Separator className="bg-white/10" />
        <ScrollArea className="min-h-0 flex-1 px-5 py-5">
          <ul className="flex flex-col gap-4 pb-8">
            {savedRestaurants.map((r) => {
              const selected = r.id === selectedRestaurantId;
              return (
                <li key={r.id}>
                  <div
                    className={cn(
                      "interactive-lift flex gap-3 rounded-[1.5rem] border border-white/10 bg-card/70 p-4 shadow-[0_12px_40px_-20px_oklch(0_0_0/0.55)] backdrop-blur-[16px] transition-colors",
                      selected &&
                        "border-primary/50 bg-primary/15 ring-2 ring-primary/35",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        selectRestaurant(r.id);
                        onOpenChange(false);
                      }}
                      aria-pressed={selected}
                      className={cn(
                        "min-w-0 flex-1 rounded-lg text-left outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                    >
                      <p className="truncate text-base font-bold leading-snug">
                        {r.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {formatAddressForJapan(r.address)}
                      </p>
                      {r.phone ? (
                        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                          {r.phone}
                        </p>
                      ) : null}
                      {typeof r.distanceMeters === "number" ? (
                        <Badge
                          variant="outline"
                          className="mt-2 tabular-nums font-normal"
                        >
                          {r.distanceMeters}m
                        </Badge>
                      ) : null}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={`${r.name} 리스트에서 삭제`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSavedRestaurant(r.id);
                      }}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </div>
    </div>,
    document.body,
  );
}
