import { NextResponse } from "next/server";
import {
  getTransactionsForBuyer,
  getTransactionsForSeller,
  getSellerByToken,
} from "@/lib/store";
import { getBuyerSessionId } from "@/lib/session";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || "buyer";

  if (role === "seller") {
    const token = request.headers.get("x-seller-token");
    if (!token) {
      return NextResponse.json({ error: "X-Seller-Token required for seller view" }, { status: 401 });
    }
    const seller = await getSellerByToken(token);
    if (!seller) {
      return NextResponse.json({ error: "Invalid seller token" }, { status: 401 });
    }
    const transactions = await getTransactionsForSeller(seller.id);
    return NextResponse.json({ transactions, role: "seller" });
  }

  const sessionId = getBuyerSessionId(request);
  if (!sessionId) {
    return NextResponse.json({ transactions: [], role: "buyer" });
  }

  const transactions = await getTransactionsForBuyer(sessionId);
  return NextResponse.json({ transactions, role: "buyer" });
}
