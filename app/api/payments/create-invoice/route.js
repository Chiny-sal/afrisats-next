import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  getItemById,
  getSellerById,
  createOrder,
} from "@/lib/store";
import { INVOICE_EXPIRY_SECONDS, MAX_INVOICE_SATS } from "@/lib/constants";
import { validateItemId, validateShippingFields } from "@/lib/validators";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  getBuyerSessionId,
  createBuyerSessionId,
  sessionCookieOptions,
} from "@/lib/session";

const LNBITS_URL = process.env.LNBITS_URL || "https://demo.lnbits.com";

export async function POST(request) {
  let buyerSessionId = getBuyerSessionId(request);
  const isNewSession = !buyerSessionId;
  if (!buyerSessionId) buyerSessionId = createBuyerSessionId();

  const rl = checkRateLimit(`invoice:${buyerSessionId}`, 5, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

  try {
    const body = await request.json();
    const { itemId, shippingAddress, contact } = body;

    if (!validateItemId(itemId)) {
      return NextResponse.json({ error: "Invalid item ID format" }, { status: 400 });
    }

    const item = await getItemById(itemId);
    if (!item || !item.active) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.price_sats > MAX_INVOICE_SATS) {
      return NextResponse.json(
        { error: `Invoice amount exceeds ${MAX_INVOICE_SATS} sats demo limit` },
        { status: 400 }
      );
    }

    let buyerShippingAddress = null;
    let buyerContact = null;

    if (item.delivery_method === "shipping") {
      const shippingCheck = validateShippingFields(shippingAddress, contact);
      if (!shippingCheck.valid) {
        return NextResponse.json({ error: shippingCheck.error }, { status: 400 });
      }
      buyerShippingAddress = shippingCheck.shippingAddress;
      buyerContact = shippingCheck.contact;
    }

    const seller = await getSellerById(item.seller_id);
    const apiKey = seller?.lnbits_invoice_key;

    if (!apiKey || apiKey.startsWith("your_lnbits")) {
      return NextResponse.json(
        { error: "Seller LNbits key not configured. Add LNBITS_SELLER_*_KEY to .env.local" },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let lnbitsRes;
    try {
      lnbitsRes = await fetch(`${LNBITS_URL}/api/v1/payments`, {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          out: false,
          amount: item.price_sats,
          memo: `AfriSats: ${item.title}`,
          expiry: INVOICE_EXPIRY_SECONDS,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      return NextResponse.json(
        {
          error:
            err.name === "AbortError"
              ? "LNbits invoice creation timed out"
              : "Could not reach LNbits — check your network",
        },
        { status: 502 }
      );
    }

    clearTimeout(timeout);

    if (!lnbitsRes.ok) {
      const errText = await lnbitsRes.text();
      return NextResponse.json(
        { error: `LNbits rejected invoice: ${errText}` },
        { status: 502 }
      );
    }

    const invoice = await lnbitsRes.json();
    const orderId = `order-${randomUUID()}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + INVOICE_EXPIRY_SECONDS * 1000
    ).toISOString();

    await createOrder({
      order_id: orderId,
      item_id: item.id,
      seller_id: item.seller_id,
      buyer_session_id: buyerSessionId,
      price_sats: item.price_sats,
      checking_id: invoice.checking_id,
      payment_request: invoice.payment_request,
      status: "PENDING",
      buyer_shipping_address: buyerShippingAddress,
      buyer_contact: buyerContact,
      created_at: createdAt,
      expires_at: expiresAt,
      paid_at: null,
      settlement_ms: null,
    });

    const response = NextResponse.json({
      orderId,
      payment_request: invoice.payment_request,
      amount_sats: item.price_sats,
      itemTitle: item.title,
      expirySeconds: INVOICE_EXPIRY_SECONDS,
      delivery_method: item.delivery_method,
    });

    if (isNewSession) {
      const opts = sessionCookieOptions(buyerSessionId);
      response.cookies.set(opts.name, opts.value, {
        httpOnly: opts.httpOnly,
        sameSite: opts.sameSite,
        path: opts.path,
        maxAge: opts.maxAge,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
