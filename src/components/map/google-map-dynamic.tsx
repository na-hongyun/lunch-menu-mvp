"use client";

import type { GoogleMapContainerProps } from "@/components/map/google-map-container";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const GoogleMapContainerLazy = dynamic(
  () =>
    import("@/components/map/google-map-container").then((m) => m.GoogleMapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[min(52vh,560px)] w-full flex-1 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-dashed border-white/15 bg-card/40 px-4 text-sm text-muted-foreground backdrop-blur-sm lg:min-h-0">
        <Loader2 className="size-9 shrink-0 animate-spin text-primary" aria-hidden />
        <p className="text-center font-medium text-foreground">지도 모듈을 불러오는 중…</p>
        <p className="max-w-xs text-center text-xs leading-relaxed">
          시크릿 창·캐시 문제 시 새로고침(Ctrl+Shift+R) 또는 일반 창에서 다시 열어 보세요.
        </p>
      </div>
    ),
  },
);

/** Maps JS API는 브라우저 전용. SSR·오래된 청크와 충돌을 줄이기 위해 지연 로드한다. */
export function GoogleMapDynamic(props: GoogleMapContainerProps) {
  return <GoogleMapContainerLazy {...props} />;
}
