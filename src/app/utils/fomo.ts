import { COINS } from "../constants/coins";
import type { Coin } from "../types";

export function genChartData(basePrice: number, seed: number) {
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

export function calcFomo(symbol: Coin) {
  const c = COINS[symbol];
  const h1 = Math.min(Math.abs(c.change1h) * 28, 38);
  const h24 = Math.min(Math.abs(c.change24h) * 8, 20);
  const vol = Math.min(Math.max(c.volumeChange, 0) * 0.55, 24);
  const ob = Math.abs(c.buyRatio - 50) * 0.35;
  const base = h1 + h24 + vol + ob;
  const up = c.change1h > 0 && c.change24h > 0;
  return Math.min(Math.round(base * (up ? 1.35 : 0.65)), 99);
}

export function fomoMeta(score: number) {
  if (score >= 70) {
    return { emoji: "😱", label: "매우 위험", color: "#ef4444", bg: "#fef2f2" };
  }
  if (score >= 50) {
    return { emoji: "😰", label: "위험", color: "#f97316", bg: "#fff7ed" };
  }
  if (score >= 30) {
    return { emoji: "😕", label: "주의", color: "#ca8a04", bg: "#fefce8" };
  }
  return { emoji: "😌", label: "안전", color: "#16a34a", bg: "#f0fdf4" };
}
