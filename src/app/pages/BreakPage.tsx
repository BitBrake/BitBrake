import { motion } from "motion/react";
import { ChevronUp } from "lucide-react";
import BrakePedal from "../components/BrakePedal";
import { BLUE, COINS } from "../constants/coins";
import type { Coin } from "../types";
export default function BreakPage({
  coin,
  countdown,
  onSkip,
}: {
  coin: Coin;
  countdown: number;
  onSkip: () => void;
}) {
  const progress = (20 - countdown) / 20;
  const r = 58;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Header */}
      <div style={{ background: BLUE }} className="px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <span className="text-white font-bold text-base flex-1">BitBreak</span>
        <span
          className="text-white text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(255,255,255,0.18)" }}
        >
          {COINS[coin].name}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Title */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">잠깐, 투자 전에!</p>
          <h1 className="text-3xl font-bold" style={{ color: BLUE }}>
            브레이크 타임 🚗
          </h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            충동적인 추격 매수를 막기 위해
            <br />
            20초간 잠시 멈춰봐요
          </p>
        </div>

        {/* Ring + pedal */}
        <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
          <svg width={160} height={160} className="absolute inset-0">
            <circle cx="80" cy="80" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke={BLUE}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
              style={{ transition: "stroke-dashoffset 0.95s linear" }}
            />
          </svg>
          <BrakePedal size={96} />
        </div>

        {/* Countdown number */}
        <motion.div
          key={countdown}
          initial={{ scale: 1.25, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center -mt-2"
        >
          <span
            className="font-bold leading-none"
            style={{ fontSize: 80, color: BLUE, fontFamily: "Inter, sans-serif" }}
          >
            {countdown}
          </span>
          <p className="text-gray-400 text-sm">초 후 자동으로 분석이 시작됩니다</p>
        </motion.div>

        {/* Tips card */}
        <div
          className="w-full rounded-2xl p-4 text-sm"
          style={{ background: "#EEF2FF" }}
        >
          <p className="font-semibold mb-2.5" style={{ color: BLUE }}>
            💡 이 시간 동안 생각해보세요
          </p>
          <ul className="space-y-1.5 text-gray-600 text-sm">
            <li>• 이 투자가 나의 재정 계획에 맞나요?</li>
            <li>• 가격 급등 소식에 흥분한 건 아닌가요?</li>
            <li>• 잃어도 괜찮은 금액인가요?</li>
          </ul>
        </div>
      </div>

      {/* Skip */}
      <div className="px-4 pb-5 flex-shrink-0">
        <button
          onClick={onSkip}
          className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-500 active:bg-gray-50"
        >
          분석 결과 바로 보기
        </button>
      </div>
    </div>
  );
}

// ─── Page 3: Analysis ─────────────────────────────────────────────────────────
