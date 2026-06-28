import { useEffect, useState } from "react";
import SelectPage from "./pages/SelectPage";
import BreakPage from "./pages/BreakPage";
import AnalysisPage from "./pages/AnalysisPage";
import DecisionPage from "./pages/DecisionPage";
import { calcFomo } from "./utils/fomo";
import type { Coin, Page } from "./types";

const BREAK_SECONDS = 10;

export default function App() {
  const [page, setPage] = useState<Page>("select");
  const [coin, setCoin] = useState<Coin>("BTC");
  const [countdown, setCountdown] = useState(BREAK_SECONDS);

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
    setCountdown(BREAK_SECONDS);
    setPage("break");
  }

  const fomoScore = calcFomo(coin);

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
