"use client";

import { useEffect, useState } from "react";
import ProductImage from "./ProductImage";

import { MAX_INVOICE_SATS } from "@/lib/constants";

export default function ItemCard({ item, onBuy, preview = false }) {
  const [btcUsd, setBtcUsd] = useState(null);

  useEffect(() => {
    fetch("/api/rates")
      .then((r) => r.json())
      .then((d) => setBtcUsd(d.btc_usd))
      .catch(() => {});
  }, []);

  const usdEstimate =
    btcUsd != null
      ? ((item.price_sats / 100_000_000) * btcUsd).toFixed(2)
      : null;

  const overLimit = item.price_sats > MAX_INVOICE_SATS;
  const typeLabel = item.product_type === "physical" ? "Physical" : "Digital";

  return (
    <div className="ticket-card flex flex-col">
      <div className="ticket-stub">
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.seller_flag}</span>
          <span className="text-xs text-muted">{item.category}</span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            item.product_type === "physical"
              ? "bg-coral/20 text-coral"
              : "bg-violet/20 text-violet"
          }`}
        >
          {typeLabel}
        </span>
      </div>

      <ProductImage item={item} />

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 font-display text-lg font-semibold text-primary">
          {item.title}
        </h3>
        <p className="mb-1 text-xs text-muted">
          {item.seller_name} · {item.seller_country}
        </p>
        <p className="mb-4 flex-1 text-sm text-muted line-clamp-2">
          {item.description}
        </p>

        <div className="mt-auto">
          <div className="mb-3">
            <span className="font-mono-num font-display text-2xl font-bold text-gold">
              {item.price_sats.toLocaleString()} sats
            </span>
            {usdEstimate && (
              <span className="ml-2 font-mono-num text-sm text-muted">
                ≈ ${usdEstimate}
              </span>
            )}
          </div>

          {!preview && (
            overLimit ? (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-muted"
              >
                Exceeds demo limit
              </button>
            ) : (
              <button
                onClick={() => onBuy?.(item)}
                className="btn-gold w-full"
              >
                Buy with Lightning ⚡
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
