import { NextResponse } from "next/server";

const LNBITS_URL = process.env.LNBITS_URL || "https://demo.lnbits.com";

export async function GET() {
  const apiKey =
    process.env.LNBITS_INVOICE_KEY ||
    process.env.LNBITS_SELLER_1_KEY;

  if (!apiKey || apiKey.startsWith("your_lnbits")) {
    return NextResponse.json({
      connected: false,
      message: "LNbits API key not configured",
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${LNBITS_URL}/api/v1/wallet`, {
      headers: { "X-Api-Key": apiKey },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({
        connected: false,
        message: `LNbits returned ${res.status}`,
      });
    }

    const wallet = await res.json();
    return NextResponse.json({
      connected: true,
      balance: wallet.balance,
      name: wallet.name,
    });
  } catch (err) {
    return NextResponse.json({
      connected: false,
      message:
        err.name === "AbortError"
          ? "LNbits connection timed out"
          : "Could not reach LNbits — check your network",
    });
  }
}
