import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { BLUE, COINS, MARKET_LIST, ORDER_TYPES } from "../constants/coins";
import { fmtMarketPrice } from "../utils/format";
import type { Market, OrderSide, OrderType, SelectedAsset } from "../types";

type UpbitMarket = {
  market: string;
  korean_name: string;
  english_name: string;
};

type UpbitDisplayCoin = {
  marketCode: string;
  symbol: string;
  koreanName: string;
  englishName: string;
};

type UpbitTicker = {
  code: string;
  tradePrice: number;
  changeRate: number;
  signedChangePrice: number;
};

const SUPPORTED_MARKETS: Market[] = ["KRW", "BTC", "USDT"];

const isKnownCoin = (symbol: string): symbol is Coin => {
  return Object.prototype.hasOwnProperty.call(COINS, symbol);
};

const getSymbolFromMarketCode = (marketCode: string) => {
  return marketCode.split("-")[1] ?? "";
};

const getMarketFromMarketCode = (marketCode: string) => {
  return marketCode.split("-")[0] as Market;
};

export default function SelectPage({ onSelect }: { onSelect: (asset: SelectedAsset) => void }) {
  const [market, setMarket] = useState<Market>("KRW");
  const [side, setSide] = useState<OrderSide>("매수");
  const [selectedMarketCode, setSelectedMarketCode] = useState("KRW-BTC");
  const [showCoinSheet, setShowCoinSheet] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("지정가");
  const [showTypeSheet, setShowTypeSheet] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [qtyInput, setQtyInput] = useState("");
  const [qtyError, setQtyError] = useState(false);
  const [upbitMarkets, setUpbitMarkets] = useState<UpbitMarket[]>([]);
  const [tickers, setTickers] = useState<Record<string, UpbitTicker>>({});

  const isBuy = side === "매수";
  const accentColor = isBuy ? "#ef4444" : "#2563eb";

  const selectedSymbol = getSymbolFromMarketCode(selectedMarketCode);

  const availableCoins = useMemo<UpbitDisplayCoin[]>(() => {
    return upbitMarkets
      .filter((item) => item.market.startsWith(`${market}-`))
      .map((item) => ({
        marketCode: item.market,
        symbol: getSymbolFromMarketCode(item.market),
        koreanName: item.korean_name,
        englishName: item.english_name,
      }))
      .sort((a, b) => a.koreanName.localeCompare(b.koreanName, "ko-KR"));
  }, [upbitMarkets, market]);

  const selectedCoinInfo = useMemo(() => {
    return (
      availableCoins.find((item) => item.marketCode === selectedMarketCode) ??
      availableCoins.find((item) => item.symbol === selectedSymbol)
    );
  }, [availableCoins, selectedMarketCode, selectedSymbol]);

  const selectedName =
    selectedCoinInfo?.koreanName ??
    (isKnownCoin(selectedSymbol) ? COINS[selectedSymbol].name : selectedSymbol);

  const currentTicker = tickers[selectedMarketCode];

  const currentPrice = currentTicker?.tradePrice ?? 0;
  const currentChange = currentTicker?.changeRate;
  const currentChangePrice = currentTicker?.signedChangePrice;

  const isCurrentMarketSupported = availableCoins.some((item) => item.marketCode === selectedMarketCode);

  const selectedSymbolMarkets = useMemo(() => {
    const result = new Set<Market>();

    upbitMarkets.forEach((item) => {
      const itemMarket = getMarketFromMarketCode(item.market);
      const itemSymbol = getSymbolFromMarketCode(item.market);

      if (SUPPORTED_MARKETS.includes(itemMarket) && itemSymbol === selectedSymbol) {
        result.add(itemMarket);
      }
    });

    return result;
  }, [upbitMarkets, selectedSymbol]);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch("https://api.upbit.com/v1/market/all?is_details=false");
        const data: UpbitMarket[] = await response.json();

        const filteredMarkets = data.filter((item) => {
          const itemMarket = getMarketFromMarketCode(item.market);
          return SUPPORTED_MARKETS.includes(itemMarket);
        });

        setUpbitMarkets(filteredMarkets);

        if (!filteredMarkets.some((item) => item.market === selectedMarketCode)) {
          const firstKrwMarket = filteredMarkets.find((item) => item.market.startsWith("KRW-"));

          if (firstKrwMarket) {
            setSelectedMarketCode(firstKrwMarket.market);
            setMarket("KRW");
          }
        }
      } catch (error) {
        console.error("업비트 마켓 목록 조회 실패:", error);
      }
    };

    fetchMarkets();
  }, []);

  useEffect(() => {
    if (availableCoins.length === 0) return;

    const currentExists = availableCoins.some((item) => item.marketCode === selectedMarketCode);

    if (!currentExists) {
      const sameSymbolCoin = availableCoins.find((item) => item.symbol === selectedSymbol);
      const nextCoin = sameSymbolCoin ?? availableCoins[0];

      setSelectedMarketCode(nextCoin.marketCode);
      setPriceInput("");
      setQtyInput("");
    }
  }, [availableCoins, selectedMarketCode, selectedSymbol]);

  useEffect(() => {
    if (availableCoins.length === 0) return;

    const codes = availableCoins.map((item) => item.marketCode);
    const websocket = new WebSocket("wss://api.upbit.com/websocket/v1");

    websocket.binaryType = "arraybuffer";

    websocket.onopen = () => {
      websocket.send(
        JSON.stringify([
          { ticket: "bitbrake-ticker" },
          {
            type: "ticker",
            codes,
          },
        ])
      );
    };

    websocket.onmessage = (event) => {
      try {
        const text =
          typeof event.data === "string"
            ? event.data
            : new TextDecoder("utf-8").decode(event.data);

        const data = JSON.parse(text);
        const code = data.code ?? data.market;

        if (!code) return;

        setTickers((prev) => ({
          ...prev,
          [code]: {
            code,
            tradePrice: Number(data.trade_price ?? 0),
            changeRate: Number(data.signed_change_rate ?? data.change_rate ?? 0) * 100,
            signedChangePrice: Number(data.signed_change_price ?? 0),
          },
        }));
      } catch (error) {
        console.error("업비트 WebSocket 데이터 파싱 실패:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("업비트 WebSocket 오류:", error);
    };

    return () => {
      websocket.close();
    };
  }, [availableCoins]);

  useEffect(() => {
    if (!currentPrice) return;

    if (orderType === "시장가" || !priceInput) {
      setPriceInput(fmtMarketPrice(currentPrice, market));
    }
  }, [currentPrice, market, orderType, priceInput]);

  const getDisplayPrice = (item: UpbitDisplayCoin) => {
    return tickers[item.marketCode]?.tradePrice ?? 0;
  };

  const getDisplayChange = (item: UpbitDisplayCoin) => {
    return tickers[item.marketCode]?.changeRate;
  };

  const getDisplayChangePrice = (item: UpbitDisplayCoin) => {
    return tickers[item.marketCode]?.signedChangePrice;
  };

  const handleMarketChange = (nextMarket: Market) => {
    const nextAvailableCoins = upbitMarkets
      .filter((item) => item.market.startsWith(`${nextMarket}-`))
      .map((item) => ({
        marketCode: item.market,
        symbol: getSymbolFromMarketCode(item.market),
        koreanName: item.korean_name,
        englishName: item.english_name,
      }));

    const sameSymbolCoin = nextAvailableCoins.find((item) => item.symbol === selectedSymbol);
    const nextCoin = sameSymbolCoin ?? nextAvailableCoins[0];

    setMarket(nextMarket);

    if (nextCoin) {
      setSelectedMarketCode(nextCoin.marketCode);
    }

    setPriceInput("");
    setQtyInput("");
  };

  const handleCoinChange = (nextCoin: UpbitDisplayCoin) => {
    setSelectedMarketCode(nextCoin.marketCode);

    const nextTickerPrice = tickers[nextCoin.marketCode]?.tradePrice;
    setPriceInput(nextTickerPrice ? fmtMarketPrice(nextTickerPrice, market) : "");

    setQtyInput("");
    setShowCoinSheet(false);
  };

  const handleTypeChange = (nextType: OrderType) => {
    setOrderType(nextType);

    if (nextType === "시장가") {
      setPriceInput(fmtMarketPrice(currentPrice, market));
    }

    setShowTypeSheet(false);
  };

  const rawPrice = orderType === "시장가" ? currentPrice : Number(priceInput.replace(/,/g, ""));
  const rawQty = parseFloat(qtyInput) || 0;
  const total = rawPrice * rawQty;

  const handlePriceInput = (value: string) => {
    if (orderType === "시장가") return;

    if (market === "KRW") {
      const digits = value.replace(/[^0-9]/g, "");
      setPriceInput(digits ? Number(digits).toLocaleString("ko-KR") : "");
      return;
    }

    setPriceInput(value.replace(/[^0-9.]/g, ""));
  };

  const handleSubmit = () => {
    if (!isCurrentMarketSupported) return;

    if (!qtyInput || rawQty <= 0) {
      setQtyError(true);
      setTimeout(() => setQtyError(false), 1200);
      return;
    }

    onSelect({
      marketCode: selectedMarketCode,
      market,
      symbol: selectedSymbol,
      name: selectedName,
      englishName: selectedCoinInfo?.englishName,
    });
  };

  const renderCoinIcon = (symbol: string, size: number) => {
    return (
      <div
        className="rounded-full flex items-center justify-center font-bold shrink-0"
        style={{
          width: size,
          height: size,
          fontSize: Math.max(10, size * 0.34),
          background: "#f3f4f6",
          color: "#6b7280",
          border: "1px solid #e5e7eb",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {symbol.slice(0, 1)}
      </div>
    );
  };

  const renderChangeText = (change?: number) => {
    if (change === undefined) return "-";
    return `${change >= 0 ? "+" : "-"}${Math.abs(change).toFixed(2)}%`;
  };

  const renderChangePriceText = (changePrice?: number) => {
    if (changePrice === undefined || changePrice === 0) return null;
    return `${changePrice >= 0 ? "+" : "-"}${fmtMarketPrice(Math.abs(changePrice), market)} ${market}`;
  };

  return (
    <div className="relative flex flex-col h-full bg-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ background: BLUE }} className="px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-base">BitBrake</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {renderCoinIcon(selectedSymbol, 22)}

          <span className="text-white font-semibold text-sm">{selectedName}</span>

          <span className="text-white/70 text-xs">{selectedMarketCode}</span>

          <div className="ml-auto text-right">
            <p
              className="font-bold text-sm"
              style={{
                color:
                  currentChange === undefined
                    ? "rgba(255,255,255,0.65)"
                    : currentChange >= 0
                      ? "#fca5a5"
                      : "#93c5fd",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {currentPrice > 0 ? fmtMarketPrice(currentPrice, market) : "시세 확인 중"}
            </p>

            {currentChange !== undefined && (
              <p className="text-[10px] font-medium" style={{ color: currentChange >= 0 ? "#fca5a5" : "#93c5fd" }}>
                {renderChangeText(currentChange)}

                {currentChangePrice !== undefined && currentChangePrice !== 0 && (
                  <span className="ml-1">{renderChangePriceText(currentChangePrice)}</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 flex rounded-xl bg-gray-100 p-1 flex-shrink-0">
        {MARKET_LIST.map((item) => {
          const isAvailable = selectedSymbolMarkets.has(item);

          return (
            <button
              key={item}
              type="button"
              onClick={() => handleMarketChange(item)}
              className="flex-1 rounded-lg py-2 text-xs font-bold transition-all"
              style={
                market === item
                  ? { background: "white", color: BLUE, boxShadow: "0 1px 4px rgba(15, 23, 42, 0.12)" }
                  : { color: isAvailable ? "#9ca3af" : "#d1d5db" }
              }
            >
              {item === "KRW" ? "원화" : item}
            </button>
          );
        })}
      </div>

      {!isCurrentMarketSupported && upbitMarkets.length > 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          {renderCoinIcon(selectedSymbol, 54)}

          <p className="mt-4 text-lg font-bold text-gray-900">{selectedName}</p>

          <p className="mt-1 text-sm font-semibold text-gray-500">{selectedMarketCode} 마켓은 지원하지 않습니다.</p>

          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            이 종목은 현재 선택한 {market} 마켓에서 거래할 수 없어요.
            <br />
            위 탭에서 지원되는 마켓을 선택해 주세요.
          </p>
        </div>
      ) : (
        <>
          <div className="flex mx-4 mt-4 rounded-xl overflow-hidden border flex-shrink-0" style={{ borderColor: "#e5e7eb" }}>
            {(["매수", "매도"] as OrderSide[]).map((item) => (
              <button
                key={item}
                onClick={() => setSide(item)}
                className="flex-1 py-3 text-sm font-bold transition-all"
                style={
                  side === item
                    ? { background: item === "매수" ? "#ef4444" : "#2563eb", color: "white" }
                    : { background: "white", color: "#9ca3af" }
                }
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-3 pb-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1.5">종목 선택</label>

              <button
                onClick={() => setShowCoinSheet(true)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm"
                style={{ borderColor: "#e5e7eb" }}
              >
                <div className="flex items-center gap-2.5">
                  {renderCoinIcon(selectedSymbol, 28)}

                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{selectedName}</p>
                    <p className="text-[11px] text-gray-400">{selectedMarketCode}</p>
                  </div>
                </div>

                <ChevronDown size={16} className="text-gray-400" />
              </button>
            </div>

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
                    {orderType === "지정가" && "원하는 가격을 직접 설정"}
                    {orderType === "시장가" && "현재 시세로 즉시 체결"}
                    {orderType === "예약-지정가" && "조건 충족 시 자동 주문"}
                  </span>

                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1.5">
                {isBuy ? "매수 가격" : "매도 가격"}
              </label>

              <div
                className="relative flex items-center px-4 py-3.5 rounded-xl border"
                style={{
                  borderColor: orderType === "시장가" ? "#e5e7eb" : accentColor,
                  borderWidth: orderType === "시장가" ? 1 : 1.5,
                }}
              >
                <input
                  type="text"
                  inputMode={market === "KRW" ? "numeric" : "decimal"}
                  value={priceInput}
                  onChange={(event) => handlePriceInput(event.target.value)}
                  disabled={orderType === "시장가"}
                  className="w-full pr-14 text-sm font-semibold text-gray-900 outline-none bg-transparent text-left"
                  style={{ color: orderType === "시장가" ? "#9ca3af" : "#111827" }}
                  placeholder={currentPrice > 0 ? "가격 입력" : "시세 확인 중"}
                />

                <span className="absolute right-4 text-xs text-gray-400 font-medium pointer-events-none">{market}</span>
              </div>

              {orderType !== "시장가" && (
                <div className="flex gap-2 mt-1.5">
                  {[-3, -1, +1, +3].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        const base = rawPrice || currentPrice;

                        if (!base) return;

                        setPriceInput(fmtMarketPrice(base * (1 + pct / 100), market));
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
                  onChange={(event) => {
                    setQtyError(false);
                    setQtyInput(event.target.value.replace(/[^0-9.]/g, ""));
                  }}
                  className="flex-1 text-sm font-semibold text-gray-900 outline-none bg-transparent"
                  placeholder="0"
                />

                <span className="text-xs text-gray-400 ml-2 font-medium">{selectedSymbol}</span>
              </div>

              {qtyError && <p className="text-[11px] text-red-500 mt-1 ml-1">수량을 입력해주세요</p>}

              <div className="flex gap-2 mt-1.5">
                {[10, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      const budget = market === "KRW" ? 5000000 : market === "BTC" ? 0.05 : 5000;
                      const basePrice = rawPrice || currentPrice;

                      if (!basePrice) return;

                      const qty = ((budget * pct) / 100) / basePrice;

                      setQtyInput(qty.toFixed(selectedSymbol === "XRP" || selectedSymbol === "DOGE" ? 0 : 6));
                    }}
                    className="flex-1 py-1 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}25` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400">주문 총액</span>

                <span className="text-lg font-extrabold" style={{ color: accentColor, fontFamily: "Inter, sans-serif" }}>
                  {total > 0 ? fmtMarketPrice(total, market) : "0"}
                  <span className="text-sm font-normal text-gray-400 ml-1">{market}</span>
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-gray-400">
                <span>
                  가격 {fmtMarketPrice(rawPrice || currentPrice, market)} {market}
                </span>

                <span>
                  수량 {rawQty > 0 ? rawQty : "0"} {selectedSymbol}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-5 pt-3 flex-shrink-0 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-md active:scale-[0.98] transition-transform"
              style={{ background: accentColor }}
            >
              확인 후 {isBuy ? "매수" : "매도"} 주문 검토하기
            </button>

            <p className="text-center text-[11px] text-gray-400 mt-2">주문 전 10초 브레이크 타임이 시작됩니다</p>
          </div>
        </>
      )}

      {showCoinSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.45)" }}>
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-t-3xl px-4 pt-4 pb-8 max-h-[72%] flex flex-col"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

            <p className="text-sm font-bold text-gray-800 mb-3 flex-shrink-0">종목 선택</p>

            <div className="overflow-y-auto pr-1 flex-1 min-h-0">
              {availableCoins.map((item) => {
                const itemPrice = getDisplayPrice(item);
                const itemChange = getDisplayChange(item);
                const itemChangePrice = getDisplayChangePrice(item);

                return (
                  <button
                    key={item.marketCode}
                    onClick={() => handleCoinChange(item)}
                    className="w-full flex items-center gap-3 py-3.5 border-b border-gray-50"
                  >
                    {renderCoinIcon(item.symbol, 36)}

                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-gray-900">{item.koreanName}</p>

                      <p className="text-xs text-gray-400">
                        {item.marketCode} · {itemPrice > 0 ? `${fmtMarketPrice(itemPrice, market)} ${market}` : "시세 확인 중"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className="text-xs font-bold"
                        style={{
                          color: itemChange === undefined ? "#9ca3af" : itemChange >= 0 ? "#ef4444" : "#2563eb",
                        }}
                      >
                        {renderChangeText(itemChange)}
                      </p>

                      {itemChangePrice !== undefined && itemChangePrice !== 0 && (
                        <p
                          className="text-[10px] font-medium mt-0.5"
                          style={{ color: itemChangePrice >= 0 ? "#ef4444" : "#2563eb" }}
                        >
                          {renderChangePriceText(itemChangePrice)}
                        </p>
                      )}

                      {selectedMarketCode === item.marketCode && <Check size={16} style={{ color: BLUE }} className="ml-auto mt-1" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowCoinSheet(false)}
              className="w-full mt-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 font-medium flex-shrink-0"
            >
              닫기
            </button>
          </motion.div>
        </div>
      )}

      {showTypeSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.45)" }}>
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-t-3xl px-4 pt-4 pb-8"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

            <p className="text-sm font-bold text-gray-800 mb-3">주문 유형 선택</p>

            {ORDER_TYPES.map((item) => (
              <button
                key={item}
                onClick={() => handleTypeChange(item)}
                className="w-full flex items-center justify-between py-3.5 border-b border-gray-50"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{item}</p>

                  <p className="text-xs text-gray-400">
                    {item === "지정가" && "원하는 가격을 직접 설정하여 주문"}
                    {item === "시장가" && "현재 시장 가격으로 즉시 체결"}
                    {item === "예약-지정가" && "설정 조건 충족 시 자동으로 주문"}
                  </p>
                </div>

                {orderType === item && <Check size={16} style={{ color: BLUE }} />}
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
