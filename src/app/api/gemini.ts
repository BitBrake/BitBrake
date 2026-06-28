import type { MarketAnalysis } from "./upbit";

export type GeminiSummaryInput = Pick<
  MarketAnalysis,
  | "currentPrice"
  | "shortTermChangeRate"
  | "volumeSpikeRate"
  | "volatilityRate"
  | "dailyChangeRate"
  | "fomoScore"
  | "fomoLevel"
> & {
  marketName: string;
};

export async function fetchGeminiSummary(input: GeminiSummaryInput) {
  const response = await fetch("/api/gemini-summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Gemini 분석 결과를 불러오지 못했습니다.");
  }

  const data = (await response.json()) as { summary?: string };
  return data.summary?.trim() ?? "";
}
