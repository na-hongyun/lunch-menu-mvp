"use client";

import type { ReviewSummaryResponseBody } from "@/lib/reviews/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const REVIEW_SUMMARY_STALE_MS = 1000 * 60 * 60;

async function fetchReviewSummary(input: {
  placeId: string;
  restaurantName: string;
}): Promise<ReviewSummaryResponseBody> {
  const res = await fetch("/api/restaurants/review-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      placeId: input.placeId,
      restaurantName: input.restaurantName,
    }),
  });

  const data = (await res.json()) as ReviewSummaryResponseBody & {
    message?: string;
    errorRaw?: string;
    errorMessage?: string;
  };

  if (!res.ok) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[place-review-summary] HTTP error", res.status, data);
    }
    throw new Error(
      typeof data.message === "string" ? data.message : "리뷰 요약을 불러오지 못했습니다.",
    );
  }

  return data as ReviewSummaryResponseBody;
}

/**
 * Google レビュー由来の AI 要約。コスト抑制のため staleTime を長めに設定。
 */
export function usePlaceReviewSummary(
  placeId: string | null | undefined,
  restaurantName: string,
  options?: { queryEnabled?: boolean },
) {
  const id = placeId?.trim() ?? "";
  const nameForKey = restaurantName.trim() || "このお店";
  const queryEnabled = Boolean(id) && (options?.queryEnabled ?? true);

  const query = useQuery({
    /** placeId만으로는 표시명 변경 시 캐시가 어긋날 수 있어 이름도 키에 포함 */
    queryKey: ["placeReviewSummary", id, nameForKey],
    queryFn: () =>
      fetchReviewSummary({
        placeId: id,
        restaurantName: nameForKey,
      }),
    enabled: queryEnabled,
    staleTime: REVIEW_SUMMARY_STALE_MS,
    gcTime: REVIEW_SUMMARY_STALE_MS * 2,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!query.error || !id) return;
    if (process.env.NODE_ENV === "development") {
      console.warn("[place-review-summary] query failed", id, query.error);
    }
  }, [query.error, id]);

  return query;
}
