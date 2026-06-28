import type { Coin, Market } from "../types";

const UPBIT_BASE_URL = "https://api.upbit.com/v1";

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

type UpbitMinuteCandle = {
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  candle_acc_trade_volume: number;
  candle_acc_trade_price: number;
};

type UpbitDayCandle = {
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  candle_acc_trade_volume: number;
  candle_acc_trade_price: number;
};

type UpbitTicker = {
  trade_price: number;
  signed_change_rate: number;
  acc_trade_price_24h: number;
  high_price: number;
  low_price: number;
};

export type FomoFactor = {
  id: "shortTerm" | "volume" | "volatility" | "daily";
  label: string;
  value: string;
  score: number;
  up: boolean;
  detail: string;
};

export type MarketAnalysis = {
  marketCode: string;
  currentPrice: number;
  shortTermChangeRate: number;
  volumeSpikeRate: number;
  volatilityRate: number;
  dailyChangeRate: number;
  fomoScore: number;
  fomoLevel: string;
  fomoMessage: string;
  updatedAt: string;
  recentVolume: number;
  averageVolume15m: number;
  recentRange: number;
  averageRange15m: number;
  tradeAmount24h: number;
  high24h: number;
  low24h: number;
  factors: FomoFactor[];
  aiAnalysis: string[];
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

async function fetchUpbit<T>(path: string, params: Record<string, string | number>) {
  const url = new URL(`${UPBIT_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`업비트 API 호출 실패 (${response.status})`);
  }
  return response.json() as Promise<T>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function pct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function ratio(value: number) {
  if (!Number.isFinite(value)) return "0.00배";
  return `${value.toFixed(2)}배`;
}

function scoreShortTerm(changeRate: number) {
  if (changeRate >= 3) return 35;
  if (changeRate >= 1) return 20;
  return 0;
}

function scoreVolume(spikeRate: number) {
  if (spikeRate >= 4) return 35;
  if (spikeRate >= 2) return 20;
  return 0;
}

function scoreVolatility(volatilityRate: number) {
  if (volatilityRate >= 2) return 20;
  return 0;
}

function scoreDaily(changeRate: number) {
  if (changeRate >= 10) return 20;
  if (changeRate >= 5) return 10;
  return 0;
}

export function getFomoLevel(score: number) {
  if (score >= 80) return "매우 높음";
  if (score >= 60) return "높음";
  if (score >= 30) return "주의";
  return "낮음";
}

function getFomoMessage(score: number) {
  if (score >= 80) {
    return "가격 상승, 거래량 급증, 변동성 확대가 동시에 나타났습니다. 감정적 진입 가능성을 확인하세요.";
  }
  if (score >= 60) {
    return "단기 급등과 거래량 증가가 함께 나타났습니다. 추격 매수 여부를 점검하세요.";
  }
  if (score >= 30) {
    return "단기 가격 또는 거래량 변화가 평소보다 큽니다.";
  }
  return "현재 단기 과열 신호는 크지 않습니다.";
}

function buildAnalysisLines(data: Omit<MarketAnalysis, "aiAnalysis" | "factors">, marketName: string) {
  return [
    `${marketName}은 현재 FOMO 리스크가 '${data.fomoLevel}' 단계입니다. ${data.fomoMessage}`,
    `최근 15분 가격은 ${pct(data.shortTermChangeRate)} 움직였고, 거래량은 7일 평균 15분 거래량의 ${ratio(
      data.volumeSpikeRate
    )} 수준입니다.`,
    `변동성은 평소 15분 범위 대비 ${ratio(data.volatilityRate)}로 계산됩니다. 짧은 시간에 움직임이 커졌다면 잠시 식혀서 보는 편이 좋습니다.`,
    "매수 전에는 왜 지금 사려는지, 감당 가능한 손실 범위가 있는지, 가격이 되돌림을 보여도 계획을 지킬 수 있는지 확인해보세요.",
    "이 정보는 투자 추천이 아니라 매수 전 판단을 돕기 위한 참고 정보입니다.",
  ];
}

export async function fetchMarketAnalysis(coin: Coin, market: Market, marketName: string): Promise<MarketAnalysis> {
  const code = toUpbitCode(market, coin);
  const [minuteCandlesDesc, dayCandles, tickers] = await Promise.all([
    fetchUpbit<UpbitMinuteCandle[]>("/candles/minutes/1", { market: code, count: 15 }),
    fetchUpbit<UpbitDayCandle[]>("/candles/days", { market: code, count: 7 }),
    fetchUpbit<UpbitTicker[]>("/ticker", { markets: code }),
  ]);

  if (minuteCandlesDesc.length === 0 || dayCandles.length === 0 || tickers.length === 0) {
    throw new Error("분석에 필요한 업비트 데이터가 부족합니다.");
  }

  const minuteCandles = [...minuteCandlesDesc].reverse();
  const firstMinute = minuteCandles[0];
  const lastMinute = minuteCandles[minuteCandles.length - 1];
  const ticker = tickers[0];

  const currentPrice = ticker.trade_price || lastMinute.trade_price;
  const shortTermChangeRate = ((lastMinute.trade_price - firstMinute.opening_price) / firstMinute.opening_price) * 100;
  const recentVolume = minuteCandles.reduce((sum, candle) => sum + candle.candle_acc_trade_volume, 0);
  const averageDailyVolume = dayCandles.reduce((sum, candle) => sum + candle.candle_acc_trade_volume, 0) / dayCandles.length;
  const averageVolume15m = averageDailyVolume / 96;
  const volumeSpikeRate = averageVolume15m > 0 ? recentVolume / averageVolume15m : 0;

  const recentHigh = Math.max(...minuteCandles.map((candle) => candle.high_price));
  const recentLow = Math.min(...minuteCandles.map((candle) => candle.low_price));
  const recentRange = recentHigh - recentLow;
  const averageDailyRange = dayCandles.reduce((sum, candle) => sum + (candle.high_price - candle.low_price), 0) / dayCandles.length;
  const averageRange15m = averageDailyRange / 96;
  const volatilityRate = averageRange15m > 0 ? recentRange / averageRange15m : 0;
  const dailyChangeRate = ticker.signed_change_rate * 100;

  const shortTermScore = scoreShortTerm(shortTermChangeRate);
  const volumeScore = scoreVolume(volumeSpikeRate);
  const volatilityScore = scoreVolatility(volatilityRate);
  const dailyScore = scoreDaily(dailyChangeRate);
  const fomoScore = clamp(shortTermScore + volumeScore + volatilityScore + dailyScore, 0, 100);
  const fomoLevel = getFomoLevel(fomoScore);
  const fomoMessage = getFomoMessage(fomoScore);

  const analysisBase = {
    marketCode: code,
    currentPrice,
    shortTermChangeRate,
    volumeSpikeRate,
    volatilityRate,
    dailyChangeRate,
    fomoScore,
    fomoLevel,
    fomoMessage,
    updatedAt: lastMinute.candle_date_time_kst,
    recentVolume,
    averageVolume15m,
    recentRange,
    averageRange15m,
    tradeAmount24h: ticker.acc_trade_price_24h,
    high24h: ticker.high_price,
    low24h: ticker.low_price,
  };

  return {
    ...analysisBase,
    factors: [
      {
        id: "shortTerm",
        label: "단기 가격 변동률",
        value: pct(shortTermChangeRate),
        score: shortTermScore,
        up: shortTermChangeRate >= 0,
        detail: `최근 15분 동안 가격이 ${pct(shortTermChangeRate)} 변했습니다. 짧은 시간에 1% 이상 오르면 충동 매수 여부를 한 번 더 확인하는 기준으로 봅니다.`,
      },
      {
        id: "volume",
        label: "평균 대비 거래량 증가율",
        value: ratio(volumeSpikeRate),
        score: volumeScore,
        up: volumeSpikeRate >= 1,
        detail: `최근 15분 거래량은 ${recentVolume.toFixed(4)} ${coin}이고, 7일 일평균을 15분 단위로 나눈 기준은 ${averageVolume15m.toFixed(
          4
        )} ${coin}입니다.`,
      },
      {
        id: "volatility",
        label: "단기 변동성 지표",
        value: ratio(volatilityRate),
        score: volatilityScore,
        up: volatilityRate >= 1,
        detail: `최근 15분 고가-저가 범위는 ${recentRange.toLocaleString("ko-KR")} ${market}이고, 7일 평균 15분 범위는 ${averageRange15m.toLocaleString(
          "ko-KR"
        )} ${market}입니다.`,
      },
      {
        id: "daily",
        label: "24시간 가격 변동률",
        value: pct(dailyChangeRate),
        score: dailyScore,
        up: dailyChangeRate >= 0,
        detail: `업비트 현재가 기준 24시간 변동률은 ${pct(dailyChangeRate)}입니다. 고가 ${ticker.high_price.toLocaleString(
          "ko-KR"
        )} ${market}, 저가 ${ticker.low_price.toLocaleString("ko-KR")} ${market}를 함께 확인하세요.`,
      },
    ],
    aiAnalysis: buildAnalysisLines(analysisBase, marketName),
  };
}
