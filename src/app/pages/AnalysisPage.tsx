import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Activity, AlertTriangle, BarChart2, ChevronDown, ChevronUp, RefreshCw, Zap } from "lucide-react";
import { fetchMarketAnalysis, type MarketAnalysis } from "../api/upbit";
import CoinBadge from "../components/CoinBadge";
import { BLUE, COINS } from "../constants/coins";
import { fomoMeta } from "../utils/fomo";
import type { Coin, Market } from "../types";

export default function AnalysisPage({
  coin,
  onScoreChange,
  onPriceChange,
  onNext,
}: {
  coin: Coin;
  onScoreChange: (score: number) => void;
  onPriceChange: (price: number) => void;
  onNext: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const c = COINS[coin];
  const market: Market = "KRW";
  const score = analysis?.fomoScore ?? 0;
  const meta = fomoMeta(score);

  const loadAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMarketAnalysis(coin, market, c.name);
      setAnalysis(data);
      onScoreChange(data.fomoScore);
      onPriceChange(data.currentPrice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 데이터를 불러오지 못했습니다.");
      setAnalysis(null);
      onScoreChange(0);
      onPriceChange(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, [coin]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <p className="text-white font-bold text-base">{c.name} 분석</p>
          <p className="text-white/60 text-[11px]">
            {analysis?.marketCode ?? `${market}-${coin}`} ·{" "}
            {analysis?.updatedAt
              ? `${analysis.updatedAt.slice(11, 16)} 기준 업비트 데이터`
              : "업비트 데이터 확인 중"}
          </p>
        </div>
        <CoinBadge symbol={coin} size={34} />
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
            <div className="space-y-2.5">
              {analysis.aiAnalysis.map((line, i) => (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
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
