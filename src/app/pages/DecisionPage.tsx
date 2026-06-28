import { useState } from "react";
import { motion } from "motion/react";
import { Home } from "lucide-react";
import BrakePedal2 from "../components/BrakePedal2";
import AccelPedal from "../components/AccelPedal";
import { BLUE } from "../constants/coins";
import { fmtMarketPrice } from "../utils/format";
import type { SelectedAsset } from "../types";

const RED = "#ef4444";
const GREEN = "#16a34a";

export default function DecisionPage({
  asset,
  currentPrice,
  score,
  onBrake,
  onAccel,
}: {
  asset: SelectedAsset;
  currentPrice: number;
  score: number;
  onBrake: () => void;
  onAccel: () => void;
}) {
  const [popup, setPopup] = useState<"brake" | "accel" | null>(null);
  const formattedPrice = currentPrice > 0 ? fmtMarketPrice(currentPrice, asset.market) : "-";

  function pick(choice: "brake" | "accel") {
    if (choice === "brake") {
      setPopup("brake");
      setTimeout(onBrake, 1200);
      return;
    }
    setPopup("accel");
    setTimeout(onAccel, 1600);
  }

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Header */}
      <div style={{ background: BLUE }} className="px-4 py-3 flex-shrink-0">
        <p className="text-white font-bold text-base">최종 결정</p>
        <p className="text-white/60 text-[11px]">
          {asset.name}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 py-8 gap-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm">분석 결과를 확인했습니다</p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            이제 어떻게 할까요?
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: BLUE }}>
            투자 전 최종 확인
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">종목명</span>
              <span className="text-sm font-bold text-gray-900">{asset.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">업비트 현재가</span>
              <span className="text-sm font-bold text-gray-900">
                {formattedPrice} {asset.market}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">FOMO 점수</span>
              <span className="text-sm font-bold text-red-500">{score}/100</span>
            </div>
          </div>
        </div>

        {/* Brake card */}
        <motion.button
          onClick={() => pick("brake")}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl border-2 p-5 flex items-center gap-5 text-left"
          style={{ borderColor: "#fecaca", background: "#fff8f8" }}
        >
          <BrakePedal2 size={80} />
          <div>
            <p className="text-lg font-bold" style={{ color: RED }}>
              일단 나가기
            </p>
            <p className="text-sm text-gray-500 mt-0.5 leading-snug">
              브레이크를 밟아요.
              <br />
              오늘은 기다려 봐요.
            </p>
          </div>
        </motion.button>

        {/* Accel card */}
        <motion.button
          onClick={() => pick("accel")}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl border-2 p-5 flex items-center gap-5 text-left"
          style={{ borderColor: "#bbf7d0", background: "#f0fdf4" }}
        >
          <AccelPedal size={80} />
          <div>
            <p className="text-lg font-bold" style={{ color: GREEN }}>
              그래도 진행하기
            </p>
            <p className="text-sm text-gray-500 mt-0.5 leading-snug">
              악셀을 밟아요.
              <br />
              투자를 진행합니다.
            </p>
          </div>
        </motion.button>

        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
          ※ 모든 투자 결정은 본인의 책임이며
          <br />
          이 서비스는 투자를 권장하지 않습니다
        </p>
      </div>

      {popup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.45)" }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-full rounded-2xl bg-white p-5 text-center shadow-2xl"
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-2xl"
              style={{
                background: popup === "accel" ? "#f0fdf4" : "#f3f4f6",
                color: popup === "accel" ? GREEN : "#111827",
              }}
            >
              {popup === "accel" ? "✓" : <Home size={24} />}
            </div>
            {popup === "accel" ? (
              <>
                <p className="text-lg font-bold text-gray-900">매수 성공!</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {formattedPrice} {asset.market}에
                  <br />
                  {asset.name} 매수를 진행했습니다.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-900">홈화면으로 돌아갑니다.</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  잠시 후 주문 화면으로 이동합니다.
                </p>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
