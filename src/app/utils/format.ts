import { COINS, COIN_LIST } from "../constants/coins";
import type { Coin, Market } from "../types";

export function fmtPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

export function fmtMarketPrice(n: number, market: Market) {
  if (market === "KRW") return Math.round(n).toLocaleString("ko-KR");
  if (market === "BTC") return n.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function getCoinPrice(symbol: Coin, market: Market) {
  return COINS[symbol].prices[market] ?? COINS[symbol].prices.KRW ?? 0;
}

export function getMarketCoins(market: Market) {
  return COIN_LIST.filter((symbol) => COINS[symbol].markets.includes(market));
}

export function fmtVol(n: number) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "조";
  if (n >= 1e8) return (n / 1e8).toFixed(0) + "억";
  return (n / 1e4).toFixed(0) + "만";
}
