import { useMemo } from "react";
import { motion } from "motion/react";
import { BLUE, COINS } from "../constants/coins";
import type { Coin } from "../types";

const REFLECTIONS = [
  "이 투자가 나의 재정 계획에 맞나요?",
  "가격 급등 소식에 흥분한 건 아닌가요?",
  "잃어도 괜찮은 금액인가요?",
  "진입 이유나 손절 기준을 생각해보았나요?",
  "남들이 산다는 이유로 따라가고 있나요?",
  "이 결정이 감정이 아니라 근거에 기반했나요?",
  "거래량 증가가 일시적인 관심 때문일 수 있나요?",
  "이 결정은 원래 계획에 포함되어 있었나요?",
  "상승률보다 리스크를 먼저 확인했나요?"
];

export default function BreakPage({
  coin,
  countdown,
  onSkip,
}: {
  coin: Coin;
  countdown: number;
  onSkip: () => void;
}) {
  const selectedReflections = useMemo(() => {
    return [...REFLECTIONS].sort(() => Math.random() - 0.5).slice(0, 4);
  }, []);

  const elapsed = 10 - countdown;
  const shownCount = Math.min(selectedReflections.length, Math.max(1, Math.floor(elapsed / 1.5) + 1));

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ background: BLUE }} className="px-4 py-3 flex items-center gap-2 flex-shrink-0">
        <span className="text-white font-bold text-base flex-1">BitBrake</span>
        <span
          className="text-white text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(255,255,255,0.18)" }}
        >
          {COINS[coin].name}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-16 gap-5">
        <div
          className="flex items-center justify-center bg-red-50 border-4 border-red-100 shadow-sm"
          style={{
            width: 118,
            height: 118,
            clipPath: "polygon(50% 0%, 86% 14%, 100% 50%, 86% 86%, 50% 100%, 14% 86%, 0% 50%, 14% 14%)",
          }}
          aria-hidden="true"
        >
          <span className="text-6xl leading-none translate-y-[1px]">🛑</span>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">잠깐, 투자 전에</p>
          <h1
            className="text-5xl leading-none"
            style={{ color: "#ef4444", fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif" }}
          >
            BITBRAKE
          </h1>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            가격 상승에 휩쓸리지 않도록
            <br />
            10초 동안 생각을 정리해보세요
          </p>
        </div>

        <div className="w-full rounded-2xl p-5" style={{ background: "#EEF2FF" }}>
          <p className="font-semibold mb-4 text-base" style={{ color: BLUE }}>
            💡 이 시간 동안 생각해보세요
          </p>
          <ul className="space-y-3 text-gray-700 text-sm font-medium leading-relaxed">
            {selectedReflections.slice(0, shownCount).map((text) => (
              <motion.li
                key={text}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                • {text}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 pb-5 flex-shrink-0">
        <p className="text-center text-xs text-gray-400 mb-2">
          {countdown}초 후 분석 결과 페이지로 이동합니다
        </p>
        <button
          onClick={onSkip}
          className="w-full py-4 rounded-2xl text-base font-bold text-white shadow-md active:scale-[0.98] transition-transform"
          style={{ background: BLUE }}
        >
          분석 결과 바로 보기
        </button>
      </div>
    </div>
  );
}
