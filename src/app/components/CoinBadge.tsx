import type { Coin } from '../types';

export default function CoinBadge({ symbol, size = 36 }: { symbol: string; size?: number }) {
  const cfg: Record<Coin, { bg: string; label: string }> = {
    BTC: { bg: "#f7931a", label: "B" },
    ETH: { bg: "#627eea", label: "E" },
    XRP: { bg: "#0085c0", label: "X" },
    SOL: { bg: "#14f195", label: "S" },
    SUI: { bg: "#6fbcf0", label: "S" },
    DOGE: { bg: "#c2a633", label: "D" },
    ADA: { bg: "#0033ad", label: "A" },
    AVAX: { bg: "#e84142", label: "A" },
    LINK: { bg: "#2a5ada", label: "L" },
    SEI: { bg: "#b91c1c", label: "S" },
    SXT: { bg: "#111827", label: "S" },
  };
  const c = cfg[symbol as Coin] ?? { bg: "#6b7280", label: symbol.slice(0, 1) || "?" };
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
