import { NextResponse } from "next/server";
import {
  getOrderById,
  updateOrder,
  markSellerEarnings,
  getSellerById,
  getItemById,
} from "@/lib/store";
import { validateOrderId } from "@/lib/validators";

const LNBITS_URL = process.env.LNBITS_URL || "https://demo.lnbits.com";

export async function GET(request, { params }) {
  const { orderId } = params;

  if (!validateOrderId(orderId)) {
    return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const item = await getItemById(order.item_id);

  if (order.status === "PAID") {
    return NextResponse.json({
      paid: true,
      expired: false,
      paid_at: order.paid_at,
      settlement_ms: order.settlement_ms,
      delivery_method: item?.delivery_method,
      delivery_value: item?.delivery_value,
      itemTitle: item?.title,
    });
  }

  if (order.status === "EXPIRED" || Date.now() > new Date(order.expires_at).getTime()) {
    await updateOrder(orderId, { status: "EXPIRED" });
    return NextResponse.json({ paid: false, expired: true });
  }

  const seller = await getSellerById(order.seller_id);
  const apiKey = seller?.lnbits_invoice_key;

  if (!apiKey || apiKey.startsWith("your_lnbits")) {
    return NextResponse.json({ error: "LNbits API key not configured" }, { status: 500 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `${LNBITS_URL}/api/v1/payments/${order.checking_id}`,
      {
        headers: { "X-Api-Key": apiKey },
        signal: controller.signal,
        cache: "no-store",
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `LNbits payment check failed (${res.status})` },
        { status: 502 }
      );
    }

    const payment = await res.json();

    if (payment.paid) {
      const paidAt = new Date().toISOString();
      const createdMs = new Date(order.created_at).getTime();
      const settlementMs = Date.now() - createdMs;

      await updateOrder(orderId, {
        status: "PAID",
        paid_at: paidAt,
        settlement_ms: settlementMs,
      });
      await markSellerEarnings(order.seller_id, order.price_sats);

      return NextResponse.json({
        paid: true,
        expired: false,
        paid_at: paidAt,
        settlement_ms: settlementMs,
        delivery_method: item?.delivery_method,
        delivery_value: item?.delivery_value,
        itemTitle: item?.title,
      });
    }

    const remainingMs = new Date(order.expires_at).getTime() - Date.now();
    return NextResponse.json({
      paid: false,
      expired: false,
      remainingSeconds: Math.max(0, Math.floor(remainingMs / 1000)),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err.name === "AbortError"
            ? "Payment verification timed out"
            : "Could not verify payment with LNbits",
      },
      { status: 504 }
    );
  }
}
