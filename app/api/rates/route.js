import { NextResponse } from "next/server";
import {
  FALLBACK_BTC_USD,
  FALLBACK_FIAT_RATES,
  RATES_CACHE_SECONDS,
} from "@/lib/constants";

let cache = { data: null, fetchedAt: 0 };

async function fetchBtcUsd() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { signal: controller.signal, next: { revalidate: RATES_CACHE_SECONDS } }
    );

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);
    const data = await res.json();
    return { btcUsd: data.bitcoin.usd, mode: "live" };
  } catch {
    return { btcUsd: FALLBACK_BTC_USD, mode: "fallback" };
  }
}

export async function GET() {
  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < RATES_CACHE_SECONDS * 1000) {
    return NextResponse.json(cache.data);
  }

  const { btcUsd, mode } = await fetchBtcUsd();

  const fiatRates = { ...FALLBACK_FIAT_RATES };

  const payload = {
    btc_usd: btcUsd,
    fiat_rates: fiatRates,
    mode,
    cached_at: new Date().toISOString(),
  };

  cache = { data: payload, fetchedAt: now };
  return NextResponse.json(payload);
}
