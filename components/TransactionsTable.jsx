"use client";

import { useState } from "react";

function DeliveryCell({ tx, role }) {
  const [expanded, setExpanded] = useState(false);

  if (tx.status !== "PAID") {
    return <span className="text-xs text-muted">—</span>;
  }

  if (tx.delivery_method === "link") {
    return (
      <a
        href={tx.delivery_value}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-jade inline-block px-3 py-1.5 text-xs"
      >
        Download
      </a>
    );
  }

  if (tx.delivery_method === "instructions") {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gold underline"
        >
          {expanded ? "Hide Instructions" : "View Instructions"}
        </button>
        {expanded && (
          <p className="mt-2 rounded-lg bg-base p-3 text-xs text-muted">
            {tx.delivery_value}
          </p>
        )}
      </div>
    );
  }

  if (tx.delivery_method === "shipping") {
    if (role === "buyer") {
      return (
        <div className="text-xs text-muted">
          <p className="mb-1 font-medium text-primary">Your shipping details:</p>
          <p>{tx.buyer_shipping_address}</p>
          <p className="mt-1">{tx.buyer_contact}</p>
          <p className="mt-2 font-medium text-jade">Seller notes:</p>
          <p>{tx.delivery_value}</p>
        </div>
      );
    }
    return (
      <div className="text-xs text-muted">
        <p className="mb-1 font-medium text-primary">Ship to:</p>
        <p>{tx.buyer_shipping_address}</p>
        <p className="mt-1">{tx.buyer_contact}</p>
      </div>
    );
  }

  return null;
}

function StatusBadge({ status }) {
  const colors = {
    PAID: "bg-jade/20 text-jade",
    PENDING: "bg-gold/20 text-gold",
    EXPIRED: "bg-coral/20 text-coral",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${colors[status] || ""}`}>
      {status}
    </span>
  );
}

export default function TransactionsTable({ transactions, role }) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No transactions yet.
      </p>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-muted">
              <th className="pb-3 pr-4">Item</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3">Delivery</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.order_id} className="border-b border-white/5">
                <td className="py-3 pr-4">
                  <span className="mr-1">{tx.seller_flag}</span>
                  {tx.item_title}
                </td>
                <td className="py-3 pr-4 font-mono-num text-gold">
                  {tx.price_sats.toLocaleString()} sats
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="py-3 pr-4 text-xs text-muted">
                  {new Date(tx.created_at).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <DeliveryCell tx={tx} role={role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {transactions.map((tx) => (
          <div
            key={tx.order_id}
            className="rounded-xl border border-white/10 bg-surface p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display font-semibold">
                {tx.seller_flag} {tx.item_title}
              </span>
              <StatusBadge status={tx.status} />
            </div>
            <p className="font-mono-num text-gold">
              {tx.price_sats.toLocaleString()} sats
            </p>
            <p className="mt-1 text-xs text-muted">
              {new Date(tx.created_at).toLocaleString()}
            </p>
            <div className="mt-3 border-t border-white/10 pt-3">
              <DeliveryCell tx={tx} role={role} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
