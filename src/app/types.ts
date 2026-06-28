export type Page = "select" | "break" | "analysis" | "decision";
export type Market = "KRW" | "BTC" | "USDT";
export type Coin = "BTC" | "ETH" | "XRP" | "SOL" | "SUI" | "DOGE" | "ADA" | "AVAX" | "LINK" | "SEI" | "SXT";

export type CoinInfo = {
  name: string;
  symbol: Coin;
  markets: Market[];
  prices: Partial<Record<Market, number>>;
  change24h: number;
  change1h: number;
  volume: number;
  volumeChange: number;
  high24h: number;
  low24h: number;
  buyRatio: number;
};

export type OrderType = "시장가" | "지정가" | "예약-지정가";
export type OrderSide = "매수" | "매도";
