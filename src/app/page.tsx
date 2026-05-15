import { AkinatorLunchApp } from "@/components/lunch/akinator-lunch-app";
import Link from "next/link";

/** 배포·브라우저 캐시로 오래된 HTML이 붙는 경우 완화 (홈만 동적) */
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col px-3 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header className="shrink-0">
        <div className="stagger-rise-children grid gap-4 md:grid-cols-12 md:gap-5">
          <div className="liquid-glass rounded-[1.75rem] p-6 shadow-[0_24px_60px_-28px_oklch(0_0_0/0.55)] md:col-span-8 md:p-8 lg:col-span-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Lunch akinator
            </p>
            <h1 className="text-balance text-3xl font-black leading-[1.12] tracking-tight text-foreground md:text-4xl lg:text-[2.65rem]">
              오늘 뭐 먹지? · 주변 실시간 추천
            </h1>
          </div>
          <div className="liquid-glass-subtle flex flex-col justify-center gap-3 rounded-[1.75rem] p-6 shadow-[0_20px_50px_-24px_oklch(0_0_0/0.45)] md:col-span-4 lg:col-span-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-[1.05rem] md:leading-relaxed">
              상황별 질문 후 Google Places로 주변 식당을 불러오고, 태그·거리·평점으로 순위를
              매깁니다. 태그가 잘 안 맞아도 근처 맛집을 잃지 않도록 보정합니다.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-accent">
              <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3 py-1 text-emerald-100">
                퍼지 매칭 · 폴백
              </span>
              <Link
                href="/debug/places"
                className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-primary underline-offset-2 hover:underline"
              >
                Raw Places
              </Link>
              <Link
                href="/debug/akinator-mock"
                className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-primary underline-offset-2 hover:underline"
              >
                가상 아키네이터
              </Link>
              <Link
                href="/debug/lunch-data"
                className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-primary underline-offset-2 hover:underline"
              >
                데이터 디버그
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="animate-stagger-rise flex min-h-0 flex-1 flex-col pt-6 md:pt-8">
        <AkinatorLunchApp />
      </main>
    </div>
  );
}
