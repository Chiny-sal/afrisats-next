import { NextResponse } from "next/server";
import {
  getAllItems,
  createItem,
  updateItem,
  getSellerByToken,
} from "@/lib/store";
import { validateItemPayload, validateItemId } from "@/lib/validators";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getSellerTokenFromRequest } from "@/lib/sellerToken";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    query: searchParams.get("q") || "",
    country: searchParams.get("country") || "all",
    category: searchParams.get("category") || "all",
    productType: searchParams.get("productType") || "all",
  };

  const items = await getAllItems(filters);
  return NextResponse.json({ items });
}

export async function POST(request) {
  const token = getSellerTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "X-Seller-Token header required" }, { status: 401 });
  }

  const seller = await getSellerByToken(token);
  if (!seller) {
    return NextResponse.json({ error: "Invalid seller token" }, { status: 401 });
  }

  const rl = checkRateLimit(`items:${token}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

  try {
    const body = await request.json();
    const validation = validateItemPayload(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data;
    if (!data.image_url) {
      data.image_url = "";
    }

    const item = await createItem(seller.id, data);
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function PATCH(request) {
  const token = getSellerTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "X-Seller-Token header required" }, { status: 401 });
  }

  const seller = await getSellerByToken(token);
  if (!seller) {
    return NextResponse.json({ error: "Invalid seller token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { itemId, active } = body;

    if (!validateItemId(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    if (typeof active !== "boolean") {
      return NextResponse.json({ error: "active must be a boolean" }, { status: 400 });
    }

    const updated = await updateItem(itemId, seller.id, { active });
    if (!updated) {
      return NextResponse.json({ error: "Item not found or not owned by seller" }, { status: 404 });
    }

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
