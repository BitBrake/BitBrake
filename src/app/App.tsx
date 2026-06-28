import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart2,
  Zap,
  AlertTriangle,
  Check,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const BLUE = "#1B2E6A";
type Page = "select" | "break" | "analysis" | "decision";
type Coin = "BTC" | "ETH" | "XRP";
const COIN_LIST: Coin[] = ["BTC", "ETH", "XRP"];

const COINS = {
  BTC: {
    name: "비트코인",
    symbol: "BTC" as Coin,
    price: 91460000,
    change24h: 0.35,
    change1h: 0.12,
    volume: 92515972000,
    volumeChange: 23.4,
    high24h: 92200000,
    low24h: 89800000,
    buyRatio: 62,
  },
  ETH: {
    name: "이더리움",
    symbol: "ETH" as Coin,
    price: 4820000,
    change24h: 2.41,
    change1h: 1.23,
    volume: 35420000000,
    volumeChange: 48.7,
    high24h: 4910000,
    low24h: 4680000,
    buyRatio: 71,
  },
  XRP: {
    name: "리플",
    symbol: "XRP" as Coin,
    price: 3182,
    change24h: -0.82,
    change1h: -0.31,
    volume: 289340000000,
    volumeChange: -12.1,
    high24h: 3220,
    low24h: 3140,
    buyRatio: 44,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genChartData(basePrice: number, seed: number) {
  const data: { i: number; v: number }[] = [];
  let v = basePrice * 0.965;
  for (let i = 0; i < 50; i++) {
    const rng = Math.sin(seed * 9301 + i * 49297 + 233) * 0.5 + 0.5;
    v *= 1 + (rng - 0.488) * 0.014;
    data.push({ i, v: Math.round(v) });
  }
  data[49].v = basePrice;
  return data;
}

function calcFomo(symbol: Coin) {
  const c = COINS[symbol];
  const h1 = Math.min(Math.abs(c.change1h) * 28, 38);
  const h24 = Math.min(Math.abs(c.change24h) * 8, 20);
  const vol = Math.min(Math.max(c.volumeChange, 0) * 0.55, 24);
  const ob = Math.abs(c.buyRatio - 50) * 0.35;
  const base = h1 + h24 + vol + ob;
  const up = c.change1h > 0 && c.change24h > 0;
  return Math.min(Math.round(base * (up ? 1.35 : 0.65)), 99);
}

function fomoMeta(score: number) {
  if (score >= 70)
    return { emoji: "😱", label: "매우 위험", color: "#ef4444", bg: "#fef2f2" };
  if (score >= 50)
    return { emoji: "😰", label: "위험", color: "#f97316", bg: "#fff7ed" };
  if (score >= 30)
    return { emoji: "😕", label: "주의", color: "#ca8a04", bg: "#fefce8" };
  return { emoji: "😌", label: "안전", color: "#16a34a", bg: "#f0fdf4" };
}

function fmtPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

function fmtVol(n: number) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "조";
  if (n >= 1e8) return (n / 1e8).toFixed(0) + "억";
  return (n / 1e4).toFixed(0) + "만";
}

// ─── SVGs ─────────────────────────────────────────────────────────────────────

function BrakePedal({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="54" fill="#EEF2FF" stroke={BLUE} strokeWidth="5" />
      {/* Arm */}
      <rect x="50" y="22" width="20" height="50" rx="8" fill={BLUE} opacity="0.85" />
      {/* Joint circle */}
      <circle cx="60" cy="72" r="8" fill={BLUE} />
      {/* Pedal plate */}
      <rect x="20" y="76" width="80" height="22" rx="7" fill={BLUE} />
      {/* Treads */}
      {[30, 42, 54, 66, 78, 90].map((x) => (
        <rect key={x} x={x} y="78" width="5" height="18" rx="2.5" fill="white" opacity="0.25" />
      ))}
      {/* Label */}
      <text
        x="60"
        y="91"
        textAnchor="middle"
        fontSize="8"
        fill="white"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        letterSpacing="1"
      >
        BRAKE
      </text>
    </svg>
  );
}

function AccelPedal({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="54" fill="#fff1f2" stroke="#dc2626" strokeWidth="5" />
      {/* Speed lines */}
      <line x1="14" y1="44" x2="38" y2="44" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" opacity="0.3" />
      <line x1="10" y1="57" x2="36" y2="57" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      <line x1="14" y1="70" x2="38" y2="70" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" opacity="0.3" />
      {/* Arm - slightly angled forward */}
      <rect
        x="50"
        y="22"
        width="20"
        height="50"
        rx="8"
        fill="#dc2626"
        opacity="0.85"
        transform="rotate(-6 60 47)"
      />
      {/* Joint */}
      <circle cx="60" cy="72" r="8" fill="#dc2626" />
      {/* Pedal plate */}
      <rect x="20" y="76" width="80" height="22" rx="7" fill="#dc2626" />
      {[30, 42, 54, 66, 78, 90].map((x) => (
        <rect key={x} x={x} y="78" width="5" height="18" rx="2.5" fill="white" opacity="0.25" />
      ))}
      <text
        x="60"
        y="91"
        textAnchor="middle"
        fontSize="8"
        fill="white"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
        letterSpacing="1"
      >
        ACCEL
      </text>
    </svg>
  );
}

function CoinBadge({ symbol, size = 36 }: { symbol: Coin; size?: number }) {
  const cfg: Record<Coin, { bg: string; label: string }> = {
    BTC: { bg: "#f7931a", label: "B" },
    ETH: { bg: "#627eea", label: "E" },
    XRP: { bg: "#0085c0", label: "X" },
  };
  const c = cfg[symbol];
  return (
    <div
      style={{ width: size, height: size, background: c.bg, fontSize: size * 0.4 }}
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
    >
      {c.label}
    </div>
  );
}

// ─── Page 1: Order Form ───────────────────────────────────────────────────────

type OrderType = "시장가" | "지정가" | "예약-지정가";
type OrderSide = "매수" | "매도";

const ORDER_TYPES: OrderType[] = ["지정가", "시장가", "예약-지정가"];

function SelectPage({ onSelect }: { onSelect: (c: Coin) => void }) {
  const [side, setSide] = useState<OrderSide>("매수");
  const [coin, setCoin] = useState<Coin>("BTC");
  const [showCoinSheet, setShowCoinSheet] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("지정가");
  const [showTypeSheet, setShowTypeSheet] = useState(false);
  const [priceInput, setPriceInput] = useState(fmtPrice(COINS.BTC.price));
  const [qtyInput, setQtyInput] = useState("");
  const [qtyError, setQtyError] = useState(false);

  const isBuy = side === "매수";
  const accentColor = isBuy ? "#ef4444" : "#2563eb";
  const currentPrice = COINS[coin].price;

  // Update price when coin or order type changes
  const handleCoinChange = (c: Coin) => {
    setCoin(c);
    setPriceInput(orderType === "시장가" ? "시장가" : fmtPrice(COINS[c].price));
    setShowCoinSheet(false);
  };
  const handleTypeChange = (t: OrderType) => {
    setOrderType(t);
    setPriceInput(t === "시장가" ? "시장가" : fmtPrice(currentPrice));
    setShowTypeSheet(false);
  };

  // Derived total
  const rawPrice = orderType === "시장가" ? currentPrice : Number(priceInput.replace(/,/g, ""));
  const rawQty = parseFloat(qtyInput) || 0;
  const total = rawPrice * rawQty;

  const handlePriceInput = (v: string) => {
    if (orderType === "시장가") return;
    const digits = v.replace(/[^0-9]/g, "");
    setPriceInput(digits ? Number(digits).toLocaleString("ko-KR") : "");
  };

  const handleSubmit = () => {
    if (!qtyInput || rawQty <= 0) {
      setQtyError(true);
      setTimeout(() => setQtyError(false), 1200);
      return;
    }
    onSelect(coin);
  };

  return (
    <div className="relative flex flex-col h-full bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Header */}
      <div style={{ background: BLUE }} className="px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-base">BitBreak</span>
          <span className="text-white/60 text-xs">주문하기</span>
        </div>
        {/* Current price ticker */}
        <div className="flex items-center gap-2 mt-2">
          <CoinBadge symbol={coin} size={22} />
          <span className="text-white font-semibold text-sm">{COINS[coin].name}</span>
          <span className="text-white/70 text-xs">{coin}/KRW</span>
          <span
            className="ml-auto font-bold text-sm"
            style={{ color: COINS[coin].change24h >= 0 ? "#fca5a5" : "#93c5fd", fontFamily: "Inter, sans-serif" }}
          >
            {fmtPrice(COINS[coin].price)}
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: COINS[coin].change24h >= 0 ? "#fca5a5" : "#93c5fd" }}
          >
            {COINS[coin].change24h >= 0 ? "▲" : "▼"}
            {Math.abs(COINS[coin].change24h).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Buy / Sell toggle */}
      <div className="flex mx-4 mt-4 rounded-xl overflow-hidden border flex-shrink-0" style={{ borderColor: "#e5e7eb" }}>
        {(["매수", "매도"] as OrderSide[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className="flex-1 py-3 text-sm font-bold transition-all"
            style={
              side === s
                ? { background: s === "매수" ? "#ef4444" : "#2563eb", color: "white" }
                : { background: "white", color: "#9ca3af" }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-3 pb-6">

        {/* 상품 선택 */}
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1.5">상품 선택</label>
          <button
            onClick={() => setShowCoinSheet(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm"
            style={{ borderColor: "#e5e7eb" }}
          >
            <div className="flex items-center gap-2.5">
              <CoinBadge symbol={coin} size={28} />
              <div className="text-left">
                <p className="font-semibold text-gray-900">{COINS[coin].name}</p>
                <p className="text-[11px] text-gray-400">{coin}/KRW</p>
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>

        {/* 주문 유형 */}
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1.5">주문 유형</label>
          <button
            onClick={() => setShowTypeSheet(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm"
            style={{ borderColor: "#e5e7eb" }}
          >
            <span className="font-semibold text-gray-900">{orderType}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">
                {orderType === "지정가" && "원하는 가격 직접 설정"}
                {orderType === "시장가" && "현재 시세로 즉시 체결"}
                {orderType === "예약-지정가" && "조건 충족시 자동 주문"}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </button>
        </div>

        {/* 가격 */}
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1.5">
            {isBuy ? "매수 가격" : "매도 가격"}
          </label>
          <div
            className="flex items-center px-4 py-3.5 rounded-xl border"
            style={{ borderColor: orderType === "시장가" ? "#e5e7eb" : accentColor, borderWidth: orderType === "시장가" ? 1 : 1.5 }}
          >
            <input
              type="text"
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => handlePriceInput(e.target.value)}
              disabled={orderType === "시장가"}
              className="flex-1 text-sm font-semibold text-gray-900 outline-none bg-transparent"
              style={{ color: orderType === "시장가" ? "#9ca3af" : "#111827" }}
              placeholder="가격 입력"
            />
            <span className="text-xs text-gray-400 ml-2 font-medium">KRW</span>
          </div>
          {orderType !== "시장가" && (
            <div className="flex gap-2 mt-1.5">
              {[-3, -1, +1, +3].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    const base = rawPrice || currentPrice;
                    setPriceInput(fmtPrice(Math.round(base * (1 + pct / 100))));
                  }}
                  className="flex-1 py-1 rounded-lg text-[11px] font-semibold border"
                  style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}10` }}
                >
                  {pct > 0 ? `+${pct}%` : `${pct}%`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 주문 수량 */}
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1.5">주문 수량</label>
          <div
            className="flex items-center px-4 py-3.5 rounded-xl border transition-all"
            style={{ borderColor: qtyError ? "#ef4444" : "#e5e7eb", borderWidth: qtyError ? 1.5 : 1 }}
          >
            <input
              type="text"
              inputMode="decimal"
              value={qtyInput}
              onChange={(e) => {
                setQtyError(false);
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setQtyInput(v);
              }}
              className="flex-1 text-sm font-semibold text-gray-900 outline-none bg-transparent"
              placeholder="0"
            />
            <span className="text-xs text-gray-400 ml-2 font-medium">{coin}</span>
          </div>
          {qtyError && (
            <p className="text-[11px] text-red-500 mt-1 ml-1">수량을 입력해주세요</p>
          )}
          {/* Pct shortcuts */}
          <div className="flex gap-2 mt-1.5">
            {[10, 25, 50, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  const budget = 5000000; // mock available balance
                  const price = rawPrice || currentPrice;
                  const qty = (budget * pct / 100) / price;
                  setQtyInput(qty.toFixed(coin === "XRP" ? 0 : 6));
                }}
                className="flex-1 py-1 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* 주문 총액 */}
        <div
          className="rounded-xl p-4"
          style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}25` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">주문 총액</span>
            <span
              className="text-lg font-extrabold"
              style={{ color: accentColor, fontFamily: "Inter, sans-serif" }}
            >
              {total > 0 ? fmtPrice(Math.round(total)) : "—"}
              <span className="text-sm font-normal text-gray-400 ml-1">KRW</span>
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>단가 {orderType === "시장가" ? "시장가" : fmtPrice(rawPrice || currentPrice)} KRW</span>
            <span>× {rawQty > 0 ? rawQty : "0"} {coin}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-5 pt-3 flex-shrink-0 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-md active:scale-[0.98] transition-transform"
          style={{ background: accentColor }}
        >
          확인 — {isBuy ? "매수" : "매도"} 주문 검토하기
        </button>
        <p className="text-center text-[11px] text-gray-400 mt-2">
          주문 전 20초 브레이크 타임이 시작됩니다
        </p>
      </div>

      {/* Coin bottom sheet */}
      {showCoinSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.45)" }}>
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-t-3xl px-4 pt-4 pb-8"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-800 mb-3">종목 선택</p>
            {COIN_LIST.map((c) => (
              <button
                key={c}
                onClick={() => handleCoinChange(c)}
                className="w-full flex items-center gap-3 py-3.5 border-b border-gray-50"
              >
                <CoinBadge symbol={c} size={36} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900">{COINS[c].name}</p>
                  <p className="text-xs text-gray-400">{c}/KRW · {fmtPrice(COINS[c].price)}</p>
                </div>
                {coin === c && <Check size={16} style={{ color: BLUE }} />}
              </button>
            ))}
            <button
              onClick={() => setShowCoinSheet(false)}
              className="w-full mt-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium"
            >
              닫기
            </button>
          </motion.div>
        </div>
      )}

      {/* Order type bottom sheet */}
      {showTypeSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.45)" }}>
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-t-3xl px-4 pt-4 pb-8"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-800 mb-3">주문 유형 선택</p>
            {ORDER_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className="w-full flex items-center justify-between py-3.5 border-b border-gray-50"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{t}</p>
                  <p className="text-xs text-gray-400">
                    {t === "지정가" && "원하는 가격을 직접 설정하여 주문"}
                    {t === "시장가" && "현재 시장 가격으로 즉시 체결"}
                    {t === "예약-지정가" && "설정 조건 충족 시 자동으로 주문"}
                  </p>
                </div>
                {orderType === t && <Check size={16} style={{ color: BLUE }} />}
              </button>
            ))}
            <button
              onClick={() => setShowTypeSheet(false)}
              className="w-full mt-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium"
            >
              닫기
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── Page 2: Brake Countdown ──────────────────────────────────────────────────

function BreakPage({
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

function AnalysisPage({ coin, onNext }: { coin: Coin; onNext: () => void }) {
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

function DecisionPage({
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

export default function App() {
  const [page, setPage] = useState<Page>("select");
  const [coin, setCoin] = useState<Coin>("BTC");
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (page !== "break") return;
    if (countdown <= 0) {
      setPage("analysis");
      return;
    }
    const t = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [page, countdown]);

  function handleSelect(c: Coin) {
    setCoin(c);
    setCountdown(20);
    setPage("break");
  }

  const fomoScore = calcFomo(coin);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      {/* Phone frame */}
      <div
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{ width: 390, height: 844, borderRadius: 44 }}
      >
        {/* Dynamic island */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-black z-20 pointer-events-none"
          style={{ width: 126, height: 37, borderRadius: 20 }}
        />

        {/* Status bar spacer */}
        <div className="absolute inset-0 pt-[52px] flex flex-col overflow-hidden">
          {page === "select" && <SelectPage onSelect={handleSelect} />}
          {page === "break" && (
            <BreakPage
              coin={coin}
              countdown={countdown}
              onSkip={() => setPage("analysis")}
            />
          )}
          {page === "analysis" && (
            <AnalysisPage coin={coin} onNext={() => setPage("decision")} />
          )}
          {page === "decision" && (
            <DecisionPage
              coin={coin}
              score={fomoScore}
              onBrake={() => {
                setCoin("BTC");
                setPage("select");
              }}
              onAccel={() => {
                setTimeout(() => {
                  setCoin("BTC");
                  setPage("select");
                }, 300);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
