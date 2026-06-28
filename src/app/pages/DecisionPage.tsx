import { useState } from "react";
import { motion } from "motion/react";
import BrakePedal from "../components/BrakePedal";
import AccelPedal from "../components/AccelPedal";
import { BLUE, COINS } from "../constants/coins";
import type { Coin } from "../types";
export default function DecisionPage({
  coin,
  score,
  onBrake,
  onAccel,
}: {
  coin: Coin;
  score: number;
  onBrake: () => void;
  onAccel: () => void;
}) {
  const [chosen, setChosen] = useState<"brake" | "accel" | null>(null);

  function pick(choice: "brake" | "accel") {
    setChosen(choice);
    setTimeout(choice === "brake" ? onBrake : onAccel, 1800);
  }

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Header */}
      <div style={{ background: BLUE }} className="px-4 py-3 flex-shrink-0">
        <p className="text-white font-bold text-base">최종 결정</p>
        <p className="text-white/60 text-[11px]">
          {COINS[coin].name} · FOMO 점수 {score}/100
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-5">
        {chosen === null ? (
          <>
            <div className="text-center">
              <p className="text-gray-400 text-sm">분석 결과를 확인했습니다</p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                이제 어떻게 할까요?
              </h2>
            </div>

            {/* Brake card */}
            <motion.button
              onClick={() => pick("brake")}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-2xl border-2 p-5 flex items-center gap-5 text-left"
              style={{ borderColor: BLUE }}
            >
              <BrakePedal size={80} />
              <div>
                <p className="text-lg font-bold" style={{ color: BLUE }}>
                  나가기
                </p>
                <p className="text-sm text-gray-500 mt-0.5 leading-snug">
                  브레이크를 밟아요.
                  <br />
                  오늘은 기다려 봐요.
                </p>
                <div
                  className="mt-2 text-[11px] px-2 py-0.5 rounded-full font-semibold inline-block"
                  style={{ background: "#EEF2FF", color: BLUE }}
                >
                  현명한 선택 ✓
                </div>
              </div>
            </motion.button>

            {/* Accel card */}
            <motion.button
              onClick={() => pick("accel")}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-2xl border-2 border-red-200 p-5 flex items-center gap-5 text-left"
              style={{ background: "#fff8f8" }}
            >
              <AccelPedal size={80} />
              <div>
                <p className="text-lg font-bold text-red-600">그래도 진행하기</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-snug">
                  악셀을 밟아요.
                  <br />
                  투자를 진행합니다.
                </p>
                <div className="mt-2 text-[11px] px-2 py-0.5 rounded-full font-semibold inline-block bg-red-100 text-red-500">
                  내 책임 하에 진행
                </div>
              </div>
            </motion.button>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              ※ 모든 투자 결정은 본인의 책임이며
              <br />
              이 서비스는 투자를 권장하지 않습니다
            </p>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center text-center gap-4"
          >
            {chosen === "brake" ? (
              <>
                <BrakePedal size={110} />
                <div>
                  <p className="text-2xl font-bold" style={{ color: BLUE }}>
                    잘 참았어요! 🎉
                  </p>
                  <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                    오늘의 충동 매수를 막았습니다.
                    <br />
                    내일의 나에게 잘했어요 👍
                  </p>
                </div>
              </>
            ) : (
              <>
                <AccelPedal size={110} />
                <div>
                  <p className="text-2xl font-bold text-red-600">투자를 시작합니다</p>
                  <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                    신중한 금액으로 진행해주세요.
                    <br />
                    업비트 앱에서 거래를 진행하세요.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
