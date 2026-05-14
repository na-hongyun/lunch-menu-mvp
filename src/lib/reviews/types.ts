/** Claude が JSON で返す中間フォーマット */
export type ReviewSummaryVerdict = "strong_positive" | "mixed" | "caution";

export interface PlaceReviewSnippet {
  text: string;
  rating?: number;
}

export interface ReviewSummarySuccessBody {
  status: "ok";
  verdict: ReviewSummaryVerdict;
  /** バッジ直下に載せる短い見出し（韓国語・親しい語り） */
  headlineKo: string;
  /** 괄호 안에 들어갈 보충 설명（좋은 점・단점 등） */
  detailKo: string;
}

export interface ReviewSummarySkippedBody {
  /** `summary_unavailable`: 키는 있으나 Gemini·네트워크 오류 등으로 요약 생략 */
  status: "no_reviews" | "ai_disabled" | "summary_unavailable";
  message: string;
  errorMessage?: string;
  errorStatus?: number | string;
  errorRaw?: string;
}

export type ReviewSummaryResponseBody =
  | ReviewSummarySuccessBody
  | ReviewSummarySkippedBody;
