import type { Coin, Market } from "../types";

export const UPBIT_WEBSOCKET_URL = "wss://api.upbit.com/websocket/v1";

export type UpbitTickerMessage = {
  code: string;
  trade_price: number;
  signed_change_rate: number;
  acc_trade_price_24h: number;
  high_price: number;
  low_price: number;
  timestamp: number;
};

export type LiveTicker = {
  code: string;
  market: Market;
  coin: Coin;
  tradePrice: number;
  changeRate: number;
  accTradePrice24h: number;
  highPrice: number;
  lowPrice: number;
  timestamp: number;
};

export function toUpbitCode(market: Market, coin: Coin) {
  return `${market}-${coin}`;
}

export function parseUpbitCode(code: string) {
  const [market, coin] = code.split("-");
  return { market: market as Market, coin: coin as Coin };
}

export function normalizeTicker(message: UpbitTickerMessage): LiveTicker {
  const { market, coin } = parseUpbitCode(message.code);

  return {
    code: message.code,
    market,
    coin,
    tradePrice: message.trade_price,
    changeRate: message.signed_change_rate * 100,
    accTradePrice24h: message.acc_trade_price_24h,
    highPrice: message.high_price,
    lowPrice: message.low_price,
    timestamp: message.timestamp,
  };
}
