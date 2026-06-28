import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Frown,
  Newspaper,
  RefreshCw,
  Smile,
  Zap,
} from "lucide-react";
import { fetchGeminiSummary } from "../api/gemini";
import { fetchMarketAnalysis, type MarketAnalysis } from "../api/upbit";
import CoinBadge from "../components/CoinBadge";
import { BLUE } from "../constants/coins";
import { fomoMeta } from "../utils/fomo";
import type { SelectedAsset } from "../types";

const MOCK_NEWS_SENTIMENTS = [
  {
    tone: "mixed",
    positiveWords: ["반등", "기관 관심", "거래대금 증가"],
    negativeWords: ["변동성", "차익 실현", "단기 과열"],
    headlines: [
      "최근 가상자산 시장, 주요 종목 중심으로 거래 관심 확대",
      "단기 상승 이후 일부 투자자 차익 실현 움직임 관찰",
      "시장 전문가들, 변동성 확대 구간에서는 신중한 접근 필요",
    ],
    summary: "최근 뉴스 흐름은 기대감과 경계감이 함께 섞여 있습니다. 가격 움직임만 보고 따라가기보다 뉴스가 이미 가격에 반영됐는지 확인해보세요.",
  },
  {
    tone: "positive",
    positiveWords: ["수급 개선", "긍정 전망", "시장 회복"],
    negativeWords: ["되돌림", "관망", "불확실성"],
    headlines: [
      "가상자산 투자 심리 회복 조짐, 주요 종목 거래량 증가",
      "시장 회복 기대감 속 일부 종목 강세 흐름",
      "단기 상승세에도 변동성 관리 필요하다는 의견 이어져",
    ],
    summary: "뉴스에서는 회복 기대감이 보이지만, 단기 상승 뒤에는 되돌림 가능성도 함께 확인할 필요가 있습니다.",
  },
  {
    tone: "cautious",
    positiveWords: ["관심 증가", "거래 활성", "저가 매수"],
    negativeWords: ["규제 우려", "급등락", "심리 위축"],
    headlines: [
      "가상자산 시장, 규제 이슈와 가격 변동성에 투자자 주목",
      "급등락 반복에 단기 투자 심리 흔들림",
      "거래 활성화에도 위험 관리 중요성 커져",
    ],
    summary: "뉴스 흐름은 다소 조심스러운 분위기입니다. 급하게 판단하기보다 가격, 거래량, 뉴스 배경을 함께 보는 것이 좋습니다.",
  },
];

function getMockNewsSentiment(symbol: string) {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return MOCK_NEWS_SENTIMENTS[seed % MOCK_NEWS_SENTIMENTS.length];
}

export default function AnalysisPage({
  asset,
  onScoreChange,
  onPriceChange,
  onNext,
}: {
  asset: SelectedAsset;
  onScoreChange: (score: number) => void;
  onPriceChange: (price: number) => void;
  onNext: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const score = analysis?.fomoScore ?? 0;
  const meta = fomoMeta(score);
  const newsSentiment = getMockNewsSentiment(asset.symbol);

  const loadAnalysis = async () => {
    setIsLoading(true);
    setIsAiLoading(false);
    setAiSummary(null);
    setAiError(null);
    setError(null);
    try {
      const data = await fetchMarketAnalysis(asset.marketCode, asset.market, asset.name, asset.symbol);
      setAnalysis(data);
      onScoreChange(data.fomoScore);
      onPriceChange(data.currentPrice);
      setIsLoading(false);

      setIsAiLoading(true);
      try {
        const summary = await fetchGeminiSummary({
          marketName: asset.name,
          currentPrice: data.currentPrice,
          shortTermChangeRate: data.shortTermChangeRate,
          volumeSpikeRate: data.volumeSpikeRate,
          volatilityRate: data.volatilityRate,
          dailyChangeRate: data.dailyChangeRate,
          fomoScore: data.fomoScore,
          fomoLevel: data.fomoLevel,
        });

        setAiSummary(summary);
      } catch (aiErr) {
        setAiError(aiErr instanceof Error ? aiErr.message : "Gemini 분석 결과를 불러오지 못했습니다.");
      } finally {
        setIsAiLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 데이터를 불러오지 못했습니다.");
      setAnalysis(null);
      onScoreChange(0);
      onPriceChange(0);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [asset.marketCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = analysis
    ? analysis.factors.map((item) => ({
        ...item,
        icon:
          item.id === "shortTerm" ? (
            <Activity size={15} />
          ) : item.id === "daily" ? (
            <BarChart2 size={15} />
          ) : item.id === "volume" ? (
            <Zap size={15} />
          ) : (
            <AlertTriangle size={15} />
          ),
      }))
    : [];

  return (
    <div className="relative flex flex-col h-full bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Header */}
      <div style={{ background: BLUE }} className="px-4 py-3 flex items-center flex-shrink-0">
        <div className="flex-1">
          <p className="text-white font-bold text-base">{asset.name} 분석</p>
          <p className="text-white/60 text-[11px]">
            {analysis?.marketCode ?? asset.marketCode} ·{" "}
            {analysis?.updatedAt
              ? `${analysis.updatedAt.slice(11, 16)} 기준 업비트 데이터`
              : "업비트 데이터 확인 중"}
          </p>
        </div>
        <CoinBadge symbol={asset.symbol} size={34} />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
        {/* FOMO card */}
        <div
          className="mx-4 mt-4 rounded-2xl border-2 p-4"
          style={{ borderColor: meta.color, background: meta.bg }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                FOMO risk
              </p>
              <p className="text-2xl font-bold" style={{ color: meta.color }}>
                {meta.emoji} {meta.label}
              </p>
              {analysis && <p className="text-xs text-gray-500 mt-1 max-w-[220px]">{analysis.fomoMessage}</p>}
            </div>
            <div className="text-right pt-1.5">
              <div className="flex items-end justify-end gap-1">
                <p
                  className="font-extrabold leading-none"
                  style={{ fontSize: 50, color: meta.color, fontFamily: "Inter, sans-serif" }}
                >
                  {score}
                </p>
                <p className="text-xs text-gray-400 leading-none mb-1">/ 100</p>
              </div>
            </div>
          </div>
          {/* Bar */}
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: meta.color }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">낮음</span>
            <span className="text-[10px] text-gray-400">높음</span>
          </div>
        </div>

        {isLoading && (
          <div className="mx-4 mt-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-700">업비트 데이터를 불러오는 중입니다.</p>
            <p className="text-xs text-gray-400 mt-1">1분 캔들 15개와 일 캔들 7개를 기준으로 계산합니다.</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mx-4 mt-3 rounded-2xl bg-red-50 border border-red-100 p-4">
            <p className="text-sm font-bold text-red-600">데이터를 불러오지 못했습니다.</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
            <button
              type="button"
              onClick={loadAnalysis}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 bg-white"
            >
              <RefreshCw size={13} /> 다시 시도
            </button>
          </div>
        )}

        {/* AI Analysis */}
        {analysis && (
          <div className="mx-4 mt-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: BLUE }}
            >
              AI 분석 결과
            </p>
            {isAiLoading ? (
              <div className="rounded-xl bg-white border border-gray-100 px-3 py-3">
                <p className="text-sm font-semibold text-gray-700">Gemini가 분석 결과를 작성하는 중입니다.</p>
                <p className="text-xs text-gray-400 mt-1">실제 업비트 데이터와 FOMO 점수를 바탕으로 요약합니다.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(aiSummary ? aiSummary.split(/\n+/).filter(Boolean) : analysis.aiAnalysis).map((line, i) => (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">
                  {line}
                </p>
                ))}
              </div>
            )}
            {aiError && (
              <p className="mt-3 text-[11px] text-gray-400">
                Gemini 연결에 실패해 기본 분석을 표시했습니다.
              </p>
            )}
          </div>
        )}

        {/* News sentiment mock */}
        {analysis && (
          <div className="mx-4 mt-3 rounded-2xl bg-white border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50" style={{ color: BLUE }}>
                <Newspaper size={16} />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">뉴스 분위기</p>
                <p className="text-[11px] text-gray-400">최근 관련 기사 키워드 요약</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-green-50 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-green-600">
                  <Smile size={14} />
                  <span className="text-xs font-bold">긍정어</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-green-700">
                  {newsSentiment.positiveWords.join(" · ")}
                </p>
              </div>
              <div className="rounded-xl bg-red-50 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-red-500">
                  <Frown size={14} />
                  <span className="text-xs font-bold">부정어</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-red-600">
                  {newsSentiment.negativeWords.join(" · ")}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {newsSentiment.headlines.map((headline) => (
                <div key={headline} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-300 shrink-0" />
                  <span>{headline}</span>
                </div>
              ))}
            </div>

            <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-600 leading-relaxed">
              {newsSentiment.summary}
            </p>
          </div>
        )}

        {/* Accordion */}
        {items.length > 0 && (
          <div className="mx-4 mt-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 overflow-hidden bg-white"
              >
                <button
                  className="w-full flex items-center gap-2.5 px-4 py-3.5"
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                >
                  <span style={{ color: BLUE, opacity: 0.7 }}>{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                    {item.label}
                  </span>
                  <span
                    className="text-sm font-bold mr-2"
                    style={{ color: item.up ? "#ef4444" : "#2563eb" }}
                  >
                    {item.value}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 mr-1">+{item.score}</span>
                  {openId === item.id ? (
                    <ChevronUp size={15} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={15} className="text-gray-400" />
                  )}
                </button>
                {openId === item.id && (
                  <div className="px-4 pb-3.5 pt-0 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
                    {item.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-3 bg-white border-t border-gray-100"
      >
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-md active:scale-[0.98] transition-transform"
          style={{ background: BLUE }}
        >
          확인 후 계속 진행
        </button>
      </div>
    </div>
  );
}

// ─── Page 4: Decision ─────────────────────────────────────────────────────────
