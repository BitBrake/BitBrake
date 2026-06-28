import { useState } from "react";
import BreakPage from "./pages/BreakPage";
import AnalysisPage from "./pages/AnalysisPage";
import type { SelectedAsset } from "./types";

type Page = "break" | "analysis";

export default function App() {
  const [page, setPage] = useState<Page>("break");
  const [asset, setAsset] = useState<SelectedAsset>({
    marketCode: "KRW-BTC",
    market: "KRW",
    symbol: "BTC",
    name: "비트코인",
  });
  const [, setFomoScore] = useState(0);
  const [, setCurrentPrice] = useState(0);

  function handleAnalyze(nextAsset: SelectedAsset) {
    setAsset(nextAsset);
    setFomoScore(0);
    setCurrentPrice(0);
    setPage("analysis");
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-white">
      {page === "break" && <BreakPage asset={asset} onAnalyze={handleAnalyze} />}
      {page === "analysis" && (
        <AnalysisPage
          asset={asset}
          onBack={() => setPage("break")}
          onScoreChange={setFomoScore}
          onPriceChange={setCurrentPrice}
        />
      )}
    </main>
  );
}
