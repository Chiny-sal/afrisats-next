"use client";

export default function BalanceSummary({ role, transactions }) {
  const paid = transactions.filter((t) => t.status === "PAID");
  const pending = transactions.filter((t) => t.status === "PENDING");

  const totalSpent = role === "buyer"
    ? paid.reduce((s, t) => s + t.price_sats, 0)
    : 0;

  const totalReceived = role === "seller"
    ? paid.reduce((s, t) => s + t.price_sats, 0)
    : 0;

  const pendingCount = pending.length;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {role === "buyer" && (
        <div className="rounded-xl border border-white/10 bg-surface p-5">
          <p className="text-xs text-muted">Total Spent</p>
          <p className="font-mono-num font-display text-2xl font-bold text-coral">
            {totalSpent.toLocaleString()} sats
          </p>
          <p className="mt-1 text-[10px] text-muted/60">
            Non-custodial — tracked locally only
          </p>
        </div>
      )}

      {role === "seller" && (
        <div className="rounded-xl border border-white/10 bg-surface p-5">
          <p className="text-xs text-muted">Total Received</p>
          <p className="font-mono-num font-display text-2xl font-bold text-jade">
            {totalReceived.toLocaleString()} sats
          </p>
          <p className="mt-1 text-[10px] text-muted/60">
            Non-custodial — tracked locally only
          </p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-surface p-5">
        <p className="text-xs text-muted">Pending Invoices</p>
        <p className="font-mono-num font-display text-2xl font-bold text-gold">
          {pendingCount}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-surface p-5">
        <p className="text-xs text-muted">Completed</p>
        <p className="font-mono-num font-display text-2xl font-bold text-primary">
          {paid.length}
        </p>
      </div>
    </div>
  );
}
