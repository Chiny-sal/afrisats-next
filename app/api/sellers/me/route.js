import { NextResponse } from "next/server";
import { getSellerByToken, publicSeller } from "@/lib/store";
import { getSellerTokenFromRequest } from "@/lib/sellerToken";

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
