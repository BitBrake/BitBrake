import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { BLUE, MARKET_LIST } from "../constants/coins";
import type { Market, SelectedAsset } from "../types";

type UpbitMarket = {
  market: string;
  korean_name: string;
  english_name: string;
};

type DisplayMarket = {
  marketCode: string;
  market: Market;
  symbol: string;
  name: string;
  englishName: string;
};

function getMarket(code: string) {
  return code.split("-")[0] as Market;
}

function getSymbol(code: string) {
  return code.split("-")[1] ?? "";
}

function toDisplayMarket(item: UpbitMarket): DisplayMarket {
  return {
    marketCode: item.market,
    market: getMarket(item.market),
    symbol: getSymbol(item.market),
    name: item.korean_name,
    englishName: item.english_name,
  };
}

export default function BreakPage({
  asset,
  onAnalyze,
}: {
  asset: SelectedAsset;
  onAnalyze: (asset: SelectedAsset) => void;
}) {
  const [market, setMarket] = useState<Market>(asset.market);
  const [selectedMarketCode, setSelectedMarketCode] = useState(asset.marketCode);
  const [upbitMarkets, setUpbitMarkets] = useState<UpbitMarket[]>([]);
  const [showAssetSheet, setShowAssetSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("https://api.upbit.com/v1/market/all?is_details=false");
        if (!response.ok) throw new Error("업비트 종목을 불러오지 못했습니다.");

        const data: UpbitMarket[] = await response.json();
        const filtered = data.filter((item) => MARKET_LIST.includes(getMarket(item.market)));
        setUpbitMarkets(filtered);

        if (!filtered.some((item) => item.market === selectedMarketCode)) {
          const firstKrw = filtered.find((item) => item.market.startsWith("KRW-"));
          if (firstKrw) {
            setMarket("KRW");
            setSelectedMarketCode(firstKrw.market);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "업비트 종목을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const availableAssets = useMemo(() => {
    return upbitMarkets
      .filter((item) => item.market.startsWith(`${market}-`))
      .map(toDisplayMarket)
      .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  }, [market, upbitMarkets]);

  const selectedAsset = useMemo<SelectedAsset>(() => {
    const found =
      availableAssets.find((item) => item.marketCode === selectedMarketCode) ??
      upbitMarkets.map(toDisplayMarket).find((item) => item.marketCode === selectedMarketCode);

    if (!found) return asset;

    return {
      marketCode: found.marketCode,
      market: found.market,
      symbol: found.symbol,
      name: found.name,
      englishName: found.englishName,
    };
  }, [asset, availableAssets, selectedMarketCode, upbitMarkets]);

  const handleMarketChange = (nextMarket: Market) => {
    const nextAssets = upbitMarkets
      .filter((item) => item.market.startsWith(`${nextMarket}-`))
      .map(toDisplayMarket);
    const sameSymbol = nextAssets.find((item) => item.symbol === selectedAsset.symbol);
    const nextAsset = sameSymbol ?? nextAssets[0];

    setMarket(nextMarket);
    if (nextAsset) setSelectedMarketCode(nextAsset.marketCode);
  };

  return (
    <div className="relative flex h-full flex-col bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ background: BLUE }} className="flex flex-shrink-0 items-center gap-2 px-4 py-3">
        <span className="flex-1 text-base font-bold text-white">BitBrake</span>
        <span
          className="px-2 py-0.5 text-xs font-medium text-white"
          style={{ background: "rgba(255,255,255,0.18)" }}
        >
          상세 분석
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-7">
        <div className="flex flex-col items-center text-center">
          <div
            className="flex items-center justify-center bg-red-50 border-4 border-red-100 shadow-sm"
            style={{
              width: 108,
              height: 108,
              clipPath: "polygon(50% 0%, 86% 14%, 100% 50%, 86% 86%, 50% 100%, 14% 86%, 0% 50%, 14% 14%)",
            }}
            aria-hidden="true"
          >
            <span className="text-5xl leading-none translate-y-[1px]">🛑</span>
          </div>

          <p className="mt-5 mb-1 text-sm text-gray-400">업비트 종목 분석</p>
          <h1
            className="text-5xl leading-none"
            style={{ color: "#ef4444", fontFamily: "'Black Han Sans', 'Noto Sans KR', sans-serif" }}
          >
            BITBRAKE
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            마켓과 종목을 선택하면
            <br />
            FOMO 위험도를 분석합니다.
          </p>
        </div>

        <div className="mt-7 w-full border border-gray-100 bg-gray-50 p-4">
          <label className="mb-2 block text-xs font-semibold text-gray-400">마켓 선택</label>
          <div className="flex bg-white p-1 border border-gray-100">
            {MARKET_LIST.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleMarketChange(item)}
                className="flex-1 py-2 text-xs font-bold transition-all"
                style={
                  market === item
                    ? { background: BLUE, color: "white", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.12)" }
                    : { color: "#9ca3af" }
                }
              >
                {item === "KRW" ? "원화" : item}
              </button>
            ))}
          </div>

          <label className="mt-4 mb-2 block text-xs font-semibold text-gray-400">종목 선택</label>
          <button
            type="button"
            onClick={() => setShowAssetSheet(true)}
            className="flex w-full items-center justify-between border border-gray-200 bg-white px-4 py-3.5 text-left"
            disabled={isLoading || availableAssets.length === 0}
          >
            <div>
              <p className="text-sm font-bold text-gray-900">{selectedAsset.name}</p>
              <p className="mt-0.5 text-xs text-gray-400">{selectedAsset.marketCode}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {isLoading && <p className="mt-2 text-xs text-gray-400">업비트 종목을 불러오는 중입니다.</p>}
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 pb-5 pt-3">
        <button
          type="button"
          onClick={() => onAnalyze(selectedAsset)}
          disabled={isLoading || Boolean(error)}
          className="w-full py-4 text-base font-bold text-white shadow-md active:scale-[0.98] transition-transform disabled:opacity-40"
          style={{ background: BLUE }}
        >
          상세 분석 보기
        </button>
      </div>

      {showAssetSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="flex max-h-[72%] flex-col bg-white px-4 pt-4 pb-8">
            <div className="mx-auto mb-4 h-1 w-10 bg-gray-200" />
            <p className="mb-3 flex-shrink-0 text-sm font-bold text-gray-800">종목 선택</p>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {availableAssets.map((item) => (
                <button
                  key={item.marketCode}
                  type="button"
                  onClick={() => {
                    setSelectedMarketCode(item.marketCode);
                    setShowAssetSheet(false);
                  }}
                  className="flex w-full items-center justify-between border-b border-gray-50 py-3.5 text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.marketCode}</p>
                  </div>
                  {selectedMarketCode === item.marketCode && (
                    <span className="text-xs font-bold" style={{ color: BLUE }}>
                      선택됨
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowAssetSheet(false)}
              className="mt-3 w-full flex-shrink-0 border border-gray-200 py-3 text-sm font-medium text-gray-500"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
