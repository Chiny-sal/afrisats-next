"use client";

import { useEffect, useState } from "react";
import RoleToggle from "@/components/RoleToggle";
import BalanceSummary from "@/components/BalanceSummary";
import TransactionsTable from "@/components/TransactionsTable";

import { SEED_SELLERS } from "@/lib/constants";

export default function DashboardPage() {
  const [role, setRole] = useState("buyer");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sellerToken, setSellerToken] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("afrisats_seller_token");
    if (stored) setSellerToken(stored);
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const headers = {};
        if (role === "seller" && sellerToken) {
          headers["X-Seller-Token"] = sellerToken;
        }
        const res = await fetch(`/api/transactions?role=${role}`, { headers });
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [role, sellerToken]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted">
            Track your purchases and sales — non-custodial, session-based only.
          </p>
        </div>
        <RoleToggle role={role} onChange={setRole} />
      </div>

      {role === "seller" && !sellerToken && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold/10 p-4">
          <p className="mb-3 text-sm text-gold">
            Select a seed seller or register on the Sell page.
          </p>
          <div className="flex flex-wrap gap-2">
            {SEED_SELLERS.map((s) => (
              <button
                key={s.token}
                onClick={() => {
                  setSellerToken(s.token);
                  localStorage.setItem("afrisats_seller_token", s.token);
                }}
                className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm hover:border-gold/50"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <BalanceSummary role={role} transactions={transactions} />
          </div>
          <h2 className="mb-4 font-display text-lg font-semibold">Transactions</h2>
          <TransactionsTable transactions={transactions} role={role} />
        </>
      )}
    </div>
  );
}
