import type {
  PlaceReviewSnippet,
  ReviewSummaryVerdict,
} from "@/lib/reviews/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

/** SDK 기본은 v1beta. v1 강제 시 모델 URL이 맞지 않아 fetch 오류가 나는 경우가 많다. */
const DEFAULT_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-1.5-flash";

function normalizeGeminiModelName(raw: string | undefined): string {
  const model = raw?.trim() || DEFAULT_MODEL;
  return model.replace(/^models\//, "");
}

/** BOM・フェンス・異常な制御文字などを除去 */
function preprocessAiResponseText(raw: string): string {
  let t = raw.replace(/^\uFEFF/, "");
  t = t.replace(/```json|```/gi, "").trim();
  t = t.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  t = t.replace(/[\u200B-\u200D\uFEFF]/g, "");
  // JSON の外側には通常現れないが混入するとパース失敗しやすい制御文字を除去（改行・タブは維持）
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return t.trim();
}

/** 最初の `{` 〜 最後の `}` を抽出（前置きテキストやフェンス混入に耐性） */
function extractBracedJsonSubstring(text: string): string | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0].trim() : null;
}

function parseJsonRecord(payload: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(payload);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI の応答がオブジェクトではありません");
  }
  return parsed as Record<string, unknown>;
}

/**
 * Gemini 応答からレビュー要約 JSON を可能な限り抽出してパースする。
 * 失敗時は RAW 全文をターミナルに出力する。
 */
function extractReviewSummaryJson(raw: string): Record<string, unknown> {
  const cleaned = preprocessAiResponseText(raw);

  const attempts: string[] = [];
  if (cleaned) attempts.push(cleaned);
  const extracted = extractBracedJsonSubstring(cleaned);
  if (extracted && extracted !== cleaned) attempts.push(extracted);

  let lastError: unknown;
  for (const candidate of attempts) {
    try {
      return parseJsonRecord(candidate.trim());
    } catch (err) {
      lastError = err;
    }
  }

  console.error("\n--- RAW AI RESPONSE ---\n");
  console.error(raw);
  console.error("\n--- END RAW AI RESPONSE ---\n");
  console.error("[gemini-review-summary] JSON parse failed after extraction attempts", {
    error: lastError,
    cleanedPreview: cleaned.slice(0, 800),
    extractedPreview: extracted?.slice(0, 800),
  });
  throw new Error("AI の JSON 解析に失敗しました");
}

function coerceVerdict(v: unknown): ReviewSummaryVerdict {
  if (v === "strong_positive" || v === "mixed" || v === "caution") return v;
  throw new Error("AI の verdict が不正です");
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}

export class GeminiReviewSummary {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async tryGenerate(model: string, prompt: string, allowJsonMime: boolean) {
    const safeModel = normalizeGeminiModelName(model || DEFAULT_MODEL);
    const generativeModel = this.genAI.getGenerativeModel({ model: safeModel });
    return generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 700,
        ...(allowJsonMime ? { responseMimeType: "application/json" } : {}),
      },
    });
  }

  async generateSummary(restaurantName: string, reviews: PlaceReviewSnippet[]) {
    const envModel = typeof process !== "undefined" ? process.env.GEMINI_MODEL?.trim() : "";
    const preferredModel = normalizeGeminiModelName(envModel || DEFAULT_MODEL);
    const fallbackModel = normalizeGeminiModelName(FALLBACK_MODEL);
    const lines = reviews.map((r, i) => {
      const stars = typeof r.rating === "number" ? `（${r.rating}/5）` : "";
      return `[${i + 1}]${stars} ${r.text.replace(/\s+/g, " ").slice(0, 600)}`;
    });
    const userPrompt = [
      `店名（参考）: ${restaurantName}`,
      "",
      lines.join("\n"),
      "",
      '다른 말 절대 하지 말고 JSON 한 개만 답해. 필드는 정확히 3개만 사용: {"verdict":"strong_positive|mixed|caution","headline":"...","detail":"..."}',
    ].join("\n");

    let result;
    try {
      result = await this.tryGenerate(preferredModel, userPrompt, true);
    } catch (firstError) {
      const firstMessage = extractErrorMessage(firstError);
      const responseMimeIssue = /responseMimeType|response mime|invalid argument/i.test(
        firstMessage,
      );
      const modelNotFound = /not found|404/i.test(firstMessage);
      if (responseMimeIssue) {
        try {
          result = await this.tryGenerate(preferredModel, userPrompt, false);
        } catch (secondError) {
          const secondMessage = extractErrorMessage(secondError);
          const secondModelNotFound = /not found|404/i.test(secondMessage);
          if (!modelNotFound && !secondModelNotFound) throw secondError;
          result = await this.tryGenerate(fallbackModel, userPrompt, false);
        }
      } else if (modelNotFound) {
        result = await this.tryGenerate(fallbackModel, userPrompt, false);
      } else {
        throw firstError;
      }
    }

    const rawAssistantText = result.response.text();
    const assistantText = preprocessAiResponseText(rawAssistantText);
    if (!assistantText) throw new Error("Gemini から本文がありません");

    const obj = extractReviewSummaryJson(rawAssistantText);
    const verdict = coerceVerdict(obj.verdict);
    const headlineKo =
      typeof obj.headline === "string"
        ? obj.headline.trim()
        : typeof obj.headlineKo === "string"
          ? obj.headlineKo.trim()
          : "";
    const detailKo =
      typeof obj.detail === "string"
        ? obj.detail.trim()
        : typeof obj.detailKo === "string"
          ? obj.detailKo.trim()
          : "";
    if (!headlineKo || !detailKo) throw new Error("AI の要約フィールドが空です");
    return { verdict, headlineKo, detailKo };
  }
}

export async function summarizePlaceReviewsWithGemini(input: {
  restaurantName: string;
  reviews: PlaceReviewSnippet[];
  apiKey: string;
  model?: string;
}): Promise<{
  verdict: ReviewSummaryVerdict;
  headlineKo: string;
  detailKo: string;
}> {
  const service = new GeminiReviewSummary(input.apiKey);
  return service.generateSummary(input.restaurantName, input.reviews);
}
