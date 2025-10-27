export const RUM_URL = process.env.RUM_URL || "http://localhost:4001/rum";

type WalletResult = "success" | "error";
type CacheLabel = "hit" | "miss";

function sendBeacon(url: string, payload: any) {
  try {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {}
  // fallback
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    .catch(() => void 0);
}

export function rumWalletRequest(opts: {
  currency: string;
  cache: CacheLabel;
  result: WalletResult;
  durationMs: number;
  errorType?: string;
}) {
  sendBeacon(RUM_URL, { type: "wallet_request", ...opts });
}

export function rumCacheEvent(opts: { currency: string; hit: boolean }) {
  sendBeacon(RUM_URL, { type: "cache_event", currency: opts.currency, hit: opts.hit });
}

export function rumPhaseParallel(durationMs: number) {
  sendBeacon(RUM_URL, { type: "phase_parallel", durationMs });
}

export function rumFlowTotal(durationMs: number) {
  sendBeacon(RUM_URL, { type: "flow_total", durationMs });
}

export function rumBlockedByBTC() {
  sendBeacon(RUM_URL, { type: "blocked_by_btc" });
}
