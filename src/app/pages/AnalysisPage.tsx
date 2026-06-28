import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Activity, AlertTriangle, BarChart2, ChevronDown, Zap } from "lucide-react";
import CoinBadge from "../components/CoinBadge";
import { BLUE, COINS } from "../constants/coins";
import { calcFomo, fomoMeta, genChartData } from "../utils/fomo";
import { fmtPrice, fmtVol } from "../utils/format";
import type { Coin } from "../types";
export default function AnalysisPage({ coin, onNext }: { coin: Coin; onNext: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const c = COINS[coin];
  const score = calcFomo(coin);
  const meta = fomoMeta(score);

  const vol24h = (((c.high24h - c.low24h) / c.low24h) * 100).toFixed(1);

  const aiLines = useMemo(() => {
    if (score >= 70)
      return [
        `🚨 ${c.name} FOMO 지수가 매우 높습니다. 단기 급등 후 조정 가능성에 주의하세요.`,
        `📈 1시간 ${c.change1h.toFixed(2)}% 상승, 거래량 ${c.volumeChange.toFixed(0)}% 급증 — 추격 매수 구간으로 판단됩니다.`,
        `⚠️ 현재가 단기 저항선 근처입니다. 분할 매수 또는 대기를 권장합니다.`,
      ];
    if (score >= 50)
      return [
        `⚡ ${c.name} FOMO 신호가 감지됩니다. 충동 매수에 주의가 필요합니다.`,
        `📊 24시간 +${c.change24h.toFixed(2)}% 상승, 거래량 증가세가 확인됩니다.`,
        `💡 이미 상승이 진행된 상태입니다. 목표가와 손절 라인을 설정 후 진입하세요.`,
      ];
    if (score >= 30)
      return [
        `📋 ${c.name} 시장 상태가 다소 불안정합니다. 추가 확인 후 진입을 권장합니다.`,
        `📉 최근 움직임은 제한적이며 큰 변동성은 관찰되지 않습니다.`,
        `✅ 리스크 관리를 철저히 하면 진입 고려 가능한 구간입니다.`,
      ];
    return [
      `✅ ${c.name} FOMO 신호가 낮습니다. 상대적으로 안정적인 상태입니다.`,
      `📊 단기 급등 없이 완만한 움직임을 보이고 있습니다.`,
      `💚 계획에 따른 투자 진행이 가능한 시장 상태입니다.`,
    ];
  }, [coin, score]); // eslint-disable-line

  const items = [
    {
      id: "h1",
      label: "최근 1시간 상승률",
      icon: <Activity size={15} />,
      value: `${c.change1h >= 0 ? "+" : ""}${c.change1h.toFixed(2)}%`,
      up: c.change1h >= 0,
      detail: `지난 1시간 동안 ${c.name}의 가격이 ${Math.abs(c.change1h).toFixed(2)}% ${
        c.change1h >= 0 ? "상승" : "하락"
      }했습니다. ${
        Math.abs(c.change1h) > 1
          ? "단기 급등으로 추격 매수 위험이 있습니다."
          : "비교적 안정적인 움직임입니다."
      }`,
    },
    {
      id: "h24",
      label: "최근 24시간 상승률",
      icon: <BarChart2 size={15} />,
      value: `${c.change24h >= 0 ? "+" : ""}${c.change24h.toFixed(2)}%`,
      up: c.change24h >= 0,
      detail: `24시간 ${c.change24h >= 0 ? "+" : ""}${c.change24h.toFixed(2)}% 변동. 고가 ${fmtPrice(
        c.high24h
      )}원, 저가 ${fmtPrice(c.low24h)}원을 기록했습니다.`,
    },
    {
      id: "vol",
      label: "거래량 변화",
      icon: <Zap size={15} />,
      value: `${c.volumeChange >= 0 ? "+" : ""}${c.volumeChange.toFixed(1)}%`,
      up: c.volumeChange >= 0,
      detail: `24시간 거래량이 평균 대비 ${Math.abs(c.volumeChange).toFixed(1)}% ${
        c.volumeChange >= 0 ? "증가" : "감소"
      }했습니다. 총 거래대금: ${fmtVol(c.volume)} KRW.${
        c.volumeChange > 30 ? " 거래량 급증은 FOMO 신호일 수 있습니다." : ""
      }`,
    },
    {
      id: "vlt",
      label: "시장 변동성",
      icon: <AlertTriangle size={15} />,
      value: `${vol24h}%`,
      up: false,
      detail: `고저 스프레드: ${fmtPrice(c.high24h - c.low24h)}원 (${vol24h}%). 매수/매도 비율: ${
        c.buyRatio
      }% / ${100 - c.buyRatio}%.${c.buyRatio > 65 ? " 매수 쏠림 현상이 관찰됩니다." : " 균형 잡힌 상태입니다."}`,
    },
  ];

  return (
    <div className="relative flex flex-col h-full bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Header */}
      <div style={{ background: BLUE }} className="px-4 py-3 flex items-center flex-shrink-0">
        <div className="flex-1">
          <p className="text-white font-bold text-base">{c.name} 분석</p>
          <p className="text-white/60 text-[11px]">
            {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 기준 실시간 데이터
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
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                FOMO Attention Signal
              </p>
              <p className="text-lg font-bold" style={{ color: meta.color }}>
                {meta.emoji} {meta.label}
              </p>
            </div>
            <div className="text-right">
              <p
                className="font-extrabold leading-none"
                style={{ fontSize: 38, color: meta.color, fontFamily: "Inter, sans-serif" }}
              >
                {score}
              </p>
              <p className="text-xs text-gray-400">/ 100</p>
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

        {/* AI Analysis */}
        <div className="mx-4 mt-3 rounded-2xl bg-gray-50 border border-gray-100 p-4">
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: BLUE }}
          >
            AI 분석 결과
          </p>
          <div className="space-y-2.5">
            {aiLines.map((line, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Accordion */}
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
          최종 결정하기 →
        </button>
      </div>
    </div>
  );
}

// ─── Page 4: Decision ─────────────────────────────────────────────────────────
