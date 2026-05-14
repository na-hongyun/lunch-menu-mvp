import { DebugRawRestaurants } from "@/components/lunch/debug-raw-restaurants";
import Link from "next/link";

export default function DebugPlacesPage() {
  return (
    <div className="min-h-dvh bg-background py-6">
      <div className="mx-auto mb-4 max-w-3xl px-4 flex flex-wrap gap-4">
        <Link href="/" className="text-sm text-primary underline">
          ← 홈(아키네이터)
        </Link>
        <Link href="/debug/akinator-mock" className="text-sm text-primary underline">
          가상 아키네이터 (API 없음)
        </Link>
        <Link href="/debug/lunch-data" className="text-sm text-primary underline">
          데이터 디버그
        </Link>
      </div>
      <DebugRawRestaurants />
    </div>
  );
}
