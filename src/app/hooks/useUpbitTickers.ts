import { useEffect, useMemo, useState } from "react";
import { normalizeTicker, toUpbitCode, UPBIT_WEBSOCKET_URL, type LiveTicker } from "../api/upbit";
import { COINS } from "../constants/coins";
import type { Coin, Market } from "../types";

type TickerMap = Partial<Record<string, LiveTicker>>;
type ConnectionState = "connecting" | "open" | "closed" | "error";

async function readSocketPayload(data: MessageEvent["data"]) {
  if (typeof data === "string") return data;
  if (data instanceof Blob) return data.text();
  if (data instanceof ArrayBuffer) return new TextDecoder("utf-8").decode(data);
  return "";
}

export function useUpbitTickers(market: Market, coins: Coin[]) {
  const [tickers, setTickers] = useState<TickerMap>({});
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");

  const codes = useMemo(
    () =>
      coins
        .filter((coin) => COINS[coin].markets.includes(market))
        .map((coin) => toUpbitCode(market, coin)),
    [market, coins]
  );

  useEffect(() => {
    if (codes.length === 0) return;

    let closedByEffect = false;
    const socket = new WebSocket(UPBIT_WEBSOCKET_URL);
    setConnectionState("connecting");

    socket.onopen = () => {
      setConnectionState("open");
      socket.send(
        JSON.stringify([
          { ticket: "bitbrake-live-ticker" },
          { type: "ticker", codes },
          { format: "DEFAULT" },
        ])
      );
    };

    socket.onmessage = async (event) => {
      try {
        const payload = await readSocketPayload(event.data);
        if (!payload) return;

        const ticker = normalizeTicker(JSON.parse(payload));
        setTickers((prev) => ({ ...prev, [ticker.code]: ticker }));
      } catch {
        // 시세 메시지 한 건 파싱 실패는 다음 메시지에서 자연스럽게 복구됩니다.
      }
    };

    socket.onerror = () => {
      setConnectionState("error");
    };

    socket.onclose = () => {
      if (!closedByEffect) setConnectionState("closed");
    };

    return () => {
      closedByEffect = true;
      socket.close();
    };
  }, [codes.join("|")]);

  return { tickers, connectionState };
}
