"use client";

import { useEffect, useState } from "react";
import { FIAT_CURRENCIES } from "@/lib/constants";

export default function ConverterPage() {
  const [sats, setSats] = useState(1000);
  const [fiatAmount, setFiatAmount] = useState("");
  const [activeCurrency, setActiveCurrency] = useState("USD");
  const [btcUsd, setBtcUsd] = useState(null);
  const [fiatRates, setFiatRates] = useState(null);
  const [mode, setMode] = useState("loading");
  const [lastEdited, setLastEdited] = useState("sats");

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => {
        if (!r.ok) throw new Error("rates failed");
        return r.json();
      })
      .then((d) => {
        setBtcUsd(d.btc_usd);
        setFiatRates(d.fiat_rates);
        setMode(d.mode);
      })
      .catch(() => setMode("fallback"));
  }, []);

  const btc = sats / 100_000_000;
  const usd = btcUsd != null ? btc * btcUsd : null;

  function toFiat(currencyCode, satAmount) {
    if (!btcUsd || !fiatRates) return null;
    const btcVal = satAmount / 100_000_000;
    const usdVal = btcVal * btcUsd;
    if (currencyCode === "USD") return usdVal;
    return usdVal * fiatRates[currencyCode];
  }

  function fromFiat(currencyCode, amount) {
    if (!btcUsd || !fiatRates || !amount) return 0;
    let usdVal = amount;
    if (currencyCode !== "USD") {
      usdVal = amount / fiatRates[currencyCode];
    }
    const btcVal = usdVal / btcUsd;
    return Math.round(btcVal * 100_000_000);
  }

  function handleSatsChange(val) {
    setLastEdited("sats");
    const num = Math.max(1, Number(val) || 0);
    setSats(num);
    const fiat = toFiat(activeCurrency, num);
    setFiatAmount(fiat != null ? fiat.toFixed(2) : "");
  }

  function handleFiatChange(val) {
    setLastEdited("fiat");
    setFiatAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setSats(fromFiat(activeCurrency, num));
    }
  }

  function handleCurrencyChange(code) {
    setActiveCurrency(code);
    const fiat = toFiat(code, sats);
    setFiatAmount(fiat != null ? fiat.toFixed(2) : "");
  }

  useEffect(() => {
    if (btcUsd && fiatRates && lastEdited === "sats") {
      const fiat = toFiat(activeCurrency, sats);
      setFiatAmount(fiat != null ? fiat.toFixed(2) : "");
    }
  }, [btcUsd, fiatRates, activeCurrency]);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 font-display text-3xl font-bold">Sats Converter</h1>
      <p className="mb-6 text-muted">
        Bidirectional sats ⇄ fiat conversion for African currencies.
      </p>

      <div className="mb-6 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            mode === "live"
              ? "bg-jade/20 text-jade"
              : mode === "fallback"
              ? "bg-gold/20 text-gold"
              : "bg-white/10 text-muted"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              mode === "live" ? "bg-jade" : mode === "fallback" ? "bg-gold" : "bg-muted"
            }`}
          />
          {mode === "loading"
            ? "Fetching rates…"
            : mode === "live"
            ? "Live rates"
            : "Fallback rates (offline)"}
        </span>
        {btcUsd && (
          <span className="font-mono-num text-xs text-muted">
            1 BTC = ${btcUsd.toLocaleString()}
          </span>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-muted">Satoshis</label>
        <input
          type="number"
          min={1}
          value={sats}
          onChange={(e) => handleSatsChange(e.target.value)}
          className="input-field font-mono-num text-2xl font-bold"
        />
        <input
          type="range"
          min={100}
          max={100000}
          step={100}
          value={sats}
          onChange={(e) => handleSatsChange(e.target.value)}
          className="mt-3 w-full accent-gold"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-muted">
          Fiat Amount
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={fiatAmount}
            onChange={(e) => handleFiatChange(e.target.value)}
            className="input-field flex-1 font-mono-num text-2xl font-bold"
          />
          <select
            value={activeCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="select-field"
          >
            {FIAT_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {FIAT_CURRENCIES.map((c) => {
          const val = toFiat(c.code, sats);
          return (
            <div
              key={c.code}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                c.code === activeCurrency
                  ? "border-jade/50 bg-jade/10"
                  : "border-white/10 bg-surface"
              }`}
            >
              <span className="flex items-center gap-2 text-sm text-muted">
                <span>{c.flag}</span>
                {c.name} ({c.code})
              </span>
              <span className="font-mono-num text-lg font-bold text-primary">
                {val != null ? val.toFixed(2) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
