import { summarizePlaceReviewsWithGemini } from "@/lib/reviews/gemini-review-summary";
import { fetchPlaceReviewSnippets } from "@/lib/reviews/google-place-reviews";
import type {
  PlaceReviewSnippet,
  ReviewSummarySkippedBody,
  ReviewSummarySuccessBody,
} from "@/lib/reviews/types";
import { NextResponse } from "next/server";
import { sanitizeAsciiApiKey } from "@/lib/env/sanitize-api-key";

const SUMMARY_CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const BYPASS_SUMMARY_CACHE_FOR_TEST = process.env.NODE_ENV === "test";
const summaryCache = new Map<
  string,
  { expiresAt: number; payload: ReviewSummarySuccessBody | ReviewSummarySkippedBody }
>();
const NO_STORE_HEADER = { "Cache-Control": "no-store" } as const;

function jsonNoStore(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...NO_STORE_HEADER,
    },
  });
}

const geminiKeyAtStartup = sanitizeAsciiApiKey(process.env.GEMINI_API_KEY);
if (geminiKeyAtStartup) {
  console.log(`[review-summary] GEMINI_API_KEY prefix: ${geminiKeyAtStartup.slice(0, 4)}`);
} else {
  console.warn("⚠️ GEMINI API KEY MISSING");
}

export async function POST(req: Request) {
  let snippets: PlaceReviewSnippet[] = [];

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ message: "JSON が不正です" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return jsonNoStore({ message: "リクエスト本文が不正です" }, { status: 400 });
  }

  const { placeId: rawPlaceId, restaurantName: rawName } = body as {
    placeId?: unknown;
    restaurantName?: unknown;
  };

  const placeId = typeof rawPlaceId === "string" ? rawPlaceId.trim() : "";
  if (!placeId) {
    return jsonNoStore({ message: "placeId は必須です" }, { status: 400 });
  }

  const restaurantName =
    typeof rawName === "string" && rawName.trim()
      ? rawName.trim()
      : "このお店";
  const cacheKey = placeId;

  const cached = BYPASS_SUMMARY_CACHE_FOR_TEST ? null : summaryCache.get(cacheKey);
  if (!BYPASS_SUMMARY_CACHE_FOR_TEST && cached && cached.expiresAt > Date.now()) {
    return jsonNoStore(cached.payload);
  }

  try {
    snippets = await fetchPlaceReviewSnippets(placeId);
    if (snippets.length === 0) {
      const payload: ReviewSummarySkippedBody = {
        status: "no_reviews",
        message:
          "公開レビューがまだないか、取得できませんでした。別の時間でもう一度お試しください。",
      };
      if (!BYPASS_SUMMARY_CACHE_FOR_TEST) {
        summaryCache.set(cacheKey, {
          expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
          payload,
        });
      }
      return jsonNoStore(payload satisfies ReviewSummarySkippedBody);
    }

    const geminiKey = sanitizeAsciiApiKey(process.env.GEMINI_API_KEY);
    if (!geminiKey) {
      const payload: ReviewSummarySkippedBody = {
        status: "ai_disabled",
        message:
          "AI レビュー要約はサーバーに GEMINI_API_KEY を設定すると利用できます。",
      };
      if (!BYPASS_SUMMARY_CACHE_FOR_TEST) {
        summaryCache.set(cacheKey, {
          expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
          payload,
        });
      }
      return jsonNoStore(payload satisfies ReviewSummarySkippedBody);
    }

    const { verdict, headlineKo, detailKo } =
      await summarizePlaceReviewsWithGemini({
        restaurantName,
        reviews: snippets,
        apiKey: geminiKey,
      });

    const payload: ReviewSummarySuccessBody = {
      status: "ok",
      verdict,
      headlineKo,
      detailKo,
    };
    if (!BYPASS_SUMMARY_CACHE_FOR_TEST) {
      summaryCache.set(cacheKey, {
        expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
        payload,
      });
    }
    return jsonNoStore(payload satisfies ReviewSummarySuccessBody);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.warn("[review-summary] Gemini or Places failed (returning skip)", {
      placeId,
      message: err.message.slice(0, 200),
    });
    const payload: ReviewSummarySkippedBody = {
      status: "summary_unavailable",
      message:
        "AI 리뷰 요약을 지금은 가져오지 못했습니다. GEMINI_API_KEY·모델(GEMINI_MODEL)을 확인하거나 잠시 후 다시 시도해 주세요.",
      errorMessage: err.message,
    };
    if (!BYPASS_SUMMARY_CACHE_FOR_TEST) {
      summaryCache.set(cacheKey, {
        expiresAt: Date.now() + SUMMARY_CACHE_TTL_MS,
        payload,
      });
    }
    return jsonNoStore(payload satisfies ReviewSummarySkippedBody);
  }
}
