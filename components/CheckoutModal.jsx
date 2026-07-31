"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import ShippingForm from "./ShippingForm";
import ProductImage from "./ProductImage";

const POLL_INTERVAL_MS = 2000;

export default function CheckoutModal({ item, onClose }) {
  const needsShipping = item.delivery_method === "shipping";
  const [phase, setPhase] = useState(needsShipping ? "shipping" : "idle");
  const [orderId, setOrderId] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [amountSats, setAmountSats] = useState(null);
  const [error, setError] = useState(null);
  const [paidAt, setPaidAt] = useState(null);
  const [settlementMs, setSettlementMs] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState(item.delivery_method);
  const [deliveryValue, setDeliveryValue] = useState(item.delivery_value);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hasWebLN, setHasWebLN] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [contact, setContact] = useState("");
  const [shippingErrors, setShippingErrors] = useState({});

  const isPollingRef = useRef(false);
  const pollTimerRef = useRef(null);
  const abortRef = useRef(null);

  const createInvoice = useCallback(async () => {
    if (needsShipping) {
      const errors = {};
      if (!shippingAddress.trim()) errors.address = "Address is required";
      if (!contact.trim()) errors.contact = "Contact is required";
      if (Object.keys(errors).length) {
        setShippingErrors(errors);
        return;
      }
      setShippingErrors({});
    }

    setPhase("creating");
    setError(null);

    try {
      const body = { itemId: item.id };
      if (needsShipping) {
        body.shippingAddress = shippingAddress;
        body.contact = contact;
      }

      const res = await fetch("/api/payments/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create invoice");
        setPhase(needsShipping ? "shipping" : "error");
        return;
      }

      setOrderId(data.orderId);
      setPaymentRequest(data.payment_request);
      setAmountSats(data.amount_sats);
      setDeliveryMethod(data.delivery_method || item.delivery_method);
      setRemainingSeconds(data.expirySeconds);
      setPhase("pending");
    } catch {
      setError("Network error — could not create invoice. Check your connection.");
      setPhase(needsShipping ? "shipping" : "error");
    }
  }, [item.id, item.delivery_method, needsShipping, shippingAddress, contact]);

  useEffect(() => {
    setHasWebLN(typeof window !== "undefined" && !!window.webln);
    if (!needsShipping) createInvoice();
  }, [needsShipping, createInvoice]);

  useEffect(() => {
    if (phase !== "pending" || !orderId) return;

    async function poll() {
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      abortRef.current = new AbortController();

      try {
        const res = await fetch(`/api/payments/verify/${orderId}`, {
          signal: abortRef.current.signal,
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Verification failed");
          setPhase("error");
          return;
        }

        if (data.paid) {
          setPaidAt(data.paid_at);
          setSettlementMs(data.settlement_ms);
          setDeliveryMethod(data.delivery_method);
          setDeliveryValue(data.delivery_value);
          setPhase("success");
          return;
        }

        if (data.expired) {
          setPhase("expired");
          return;
        }

        if (data.remainingSeconds != null) {
          setRemainingSeconds(data.remainingSeconds);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Payment verification timed out");
        }
      } finally {
        isPollingRef.current = false;
      }
    }

    pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    poll();

    return () => {
      clearInterval(pollTimerRef.current);
      abortRef.current?.abort();
    };
  }, [phase, orderId]);

  async function handleWebLN() {
    if (!window.webln) return;
    try {
      await window.webln.enable();
      await window.webln.sendPayment(paymentRequest);
    } catch (err) {
      if (!err.message?.includes("User rejected")) {
        setError(`WebLN error: ${err.message}`);
      }
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(paymentRequest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-surface p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-primary"
          aria-label="Close"
        >
          ✕
        </button>

        <ProductImage item={item} className="mb-4 rounded-lg" />

        <h2 className="mb-1 font-display text-xl font-bold">Checkout</h2>
        <p className="mb-4 text-sm text-muted">{item.title}</p>

        {phase === "shipping" && (
          <div>
            <ShippingForm
              address={shippingAddress}
              contact={contact}
              onAddressChange={setShippingAddress}
              onContactChange={setContact}
              errors={shippingErrors}
            />
            {error && (
              <p className="mt-3 text-sm text-coral">{error}</p>
            )}
            <button
              onClick={createInvoice}
              disabled={!shippingAddress.trim() || !contact.trim()}
              className="btn-gold mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate Invoice
            </button>
          </div>
        )}

        {phase === "idle" && !needsShipping && (
          <div className="flex flex-col items-center py-4">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            <p className="text-sm text-muted">Preparing checkout…</p>
          </div>
        )}

        {phase === "creating" && (
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            <p className="text-sm text-muted">Creating Lightning invoice…</p>
          </div>
        )}

        {phase === "error" && (
          <div className="text-center">
            <div className="mb-4 rounded-lg bg-coral/20 p-4 text-sm text-coral">
              {error}
            </div>
            <button onClick={createInvoice} className="btn-gold">
              Try Again
            </button>
          </div>
        )}

        {phase === "expired" && (
          <div className="text-center">
            <div className="mb-4 rounded-lg bg-gold/20 p-4 text-sm text-gold">
              Invoice expired — generate a new one to continue.
            </div>
            <button onClick={createInvoice} className="btn-gold">
              Generate New Invoice
            </button>
          </div>
        )}

        {phase === "pending" && paymentRequest && (
          <div className="flex flex-col items-center">
            <p className="mb-1 font-mono-num font-display text-2xl font-bold text-gold">
              {amountSats?.toLocaleString()} sats
            </p>
            {remainingSeconds != null && (
              <p className="mb-4 font-mono-num text-xs text-muted">
                Expires in {formatTime(remainingSeconds)}
              </p>
            )}

            <div className="mb-4 rounded-xl border border-white/10 bg-white p-4">
              <QRCodeSVG value={paymentRequest} size={200} level="M" />
            </div>

            <div className="mb-2 flex w-full gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-primary hover:bg-white/5"
              >
                {copied ? "Copied!" : "Copy Invoice"}
              </button>
              <a
                href={`lightning:${paymentRequest}`}
                className="flex-1 rounded-lg border border-jade px-4 py-2 text-center text-sm font-medium text-jade hover:bg-jade/10"
              >
                Open in Wallet
              </a>
            </div>
            <p className="mb-4 text-center text-[10px] text-muted">
              Opens your wallet app if one is installed
            </p>

            {hasWebLN ? (
              <button onClick={handleWebLN} className="btn-jade mb-4 w-full">
                Pay with WebLN ⚡
              </button>
            ) : (
              <p className="mb-4 text-center text-xs text-muted">
                Install{" "}
                <a
                  href="https://getalby.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-jade underline"
                >
                  Alby
                </a>{" "}
                for one-click browser payments
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              Waiting for payment…
            </div>
          </div>
        )}

        {phase === "success" && (
          <div className="text-center">
            <div className="animate-stamp mb-4 inline-block rounded-lg border-4 border-jade px-6 py-3 font-display text-lg font-bold text-jade">
              PAID ⚡
            </div>
            <h3 className="mb-2 font-display text-lg font-bold text-jade">
              Payment Received!
            </h3>
            <p className="mb-1 font-mono-num text-sm text-muted">
              {amountSats?.toLocaleString()} sats settled
              {settlementMs != null && ` in ${(settlementMs / 1000).toFixed(1)}s`}
            </p>
            {paidAt && (
              <p className="mb-4 font-mono-num text-xs text-muted">
                Confirmed at {new Date(paidAt).toLocaleTimeString()}
              </p>
            )}

            {deliveryMethod === "link" && deliveryValue && (
              <a
                href={deliveryValue}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-jade inline-block"
              >
                Download Your Purchase
              </a>
            )}

            {deliveryMethod === "instructions" && (
              <div className="mt-2 rounded-lg bg-base p-4 text-left text-sm text-muted">
                <p className="mb-1 font-semibold text-primary">Delivery Instructions</p>
                <p>{deliveryValue}</p>
              </div>
            )}

            {deliveryMethod === "shipping" && (
              <div className="mt-2 rounded-lg bg-base p-4 text-left text-sm text-muted">
                <p className="mb-1 font-semibold text-jade">
                  Shipping details received
                </p>
                <p>{deliveryValue}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
