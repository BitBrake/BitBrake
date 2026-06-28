import { useEffect, useState } from "react";
import SelectPage from "./pages/SelectPage";
import BreakPage from "./pages/BreakPage";
import AnalysisPage from "./pages/AnalysisPage";
import DecisionPage from "./pages/DecisionPage";
import type { Coin, Market, Page } from "./types";

export default function App() {
  const [page, setPage] = useState<Page>("select");
  const [coin, setCoin] = useState<Coin>("BTC");
  const [fomoScore, setFomoScore] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [countdown, setCountdown] = useState(20);
  const market: Market = "KRW";

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
    setFomoScore(0);
    setCurrentPrice(0);
    setCountdown(20);
    setPage("break");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{ width: 390, height: 844, borderRadius: 44 }}
      >
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-black z-20 pointer-events-none"
          style={{ width: 126, height: 37, borderRadius: 20 }}
        />

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
            <AnalysisPage
              coin={coin}
              onScoreChange={setFomoScore}
              onPriceChange={setCurrentPrice}
              onNext={() => setPage("decision")}
            />
          )}
          {page === "decision" && (
            <DecisionPage
              coin={coin}
              market={market}
              currentPrice={currentPrice}
              score={fomoScore}
              onBrake={() => {
                setCoin("BTC");
                setPage("select");
              }}
              onAccel={() => {
                setCoin("BTC");
                setPage("select");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
