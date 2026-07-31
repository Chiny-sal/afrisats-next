import { NextResponse } from "next/server";
import { createSeller, getSellerByToken, publicSeller } from "@/lib/store";
import { COUNTRY_FLAGS } from "@/lib/constants";
import { sanitizeString } from "@/lib/validators";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/session";
import { getSellerTokenFromRequest } from "@/lib/sellerToken";

export async function POST(request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`sellers:${ip}`, 3, 10 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

  try {
    const body = await request.json();
    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 200);
    const location = sanitizeString(body.location, 200);
    const country = sanitizeString(body.country, 100);
    const lnbitsKey = sanitizeString(body.lnbits_invoice_key, 500);
    const payoutNote = sanitizeString(body.payout_note, 500) || "";

    if (!name || !email || !location || !country) {
      return NextResponse.json(
        { error: "Name, email, location, and country are required" },
        { status: 400 }
      );
    }

    if (!lnbitsKey) {
      return NextResponse.json(
        { error: "LNbits invoice key is required" },
        { status: 400 }
      );
    }

    const seller = await createSeller({
      name,
      email,
      location,
      country,
      flag: COUNTRY_FLAGS[country] || "🌍",
      lnbits_invoice_key: lnbitsKey,
      payout_note: payoutNote,
    });

    return NextResponse.json(
      {
        seller: publicSeller(seller),
        seller_token: seller.seller_token,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function GET(request) {
  const token = getSellerTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "X-Seller-Token header required" }, { status: 401 });
  }

  const seller = await getSellerByToken(token);
  if (!seller) {
    return NextResponse.json({ error: "Invalid seller token" }, { status: 401 });
  }

  return NextResponse.json({ seller: publicSeller(seller) });
}
