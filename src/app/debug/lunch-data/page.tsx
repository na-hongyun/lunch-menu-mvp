import { DebugLunchDataPanel } from "@/components/lunch/debug-lunch-data-panel";
import Link from "next/link";

export default function DebugLunchDataPage() {
  return (
    <div className="min-h-dvh bg-background py-6">
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap gap-4 px-4">
        <Link href="/" className="text-sm text-primary underline">
          ← 홈(아키네이터)
        </Link>
        <Link href="/debug/places" className="text-sm text-primary underline">
          Raw Places
        </Link>
        <Link href="/debug/akinator-mock" className="text-sm text-primary underline">
          가상 아키네이터
        </Link>
      </div>
      <DebugLunchDataPanel />
    </div>
  );
}
