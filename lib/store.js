/**
 * AfriSats data-access layer — Postgres via Prisma.
 */

import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { getItemImageUrl } from "./images";

function toIso(value) {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
}

function serializeSeller(seller) {
  if (!seller) return null;
  return { ...seller, created_at: toIso(seller.created_at) };
}

function serializeItem(item) {
  if (!item) return null;
  return {
    ...item,
    image_url: item.image_url || "",
    created_at: toIso(item.created_at),
  };
}

function serializeOrder(order) {
  if (!order) return null;
  return {
    ...order,
    created_at: toIso(order.created_at),
    expires_at: toIso(order.expires_at),
    paid_at: toIso(order.paid_at),
  };
}

export function publicSeller(seller) {
  if (!seller) return null;
  const { lnbits_invoice_key, seller_token, ...safe } = seller;
  return safe;
}

export async function getSellerByToken(token) {
  const normalized = typeof token === "string" ? token.trim() : "";
  if (!normalized) return null;
  const seller = await prisma.seller.findUnique({
    where: { seller_token: normalized },
  });
  return serializeSeller(seller);
}

export async function getSellerById(sellerId) {
  const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
  return serializeSeller(seller);
}

export async function getAllSellers() {
  const sellers = await prisma.seller.findMany();
  return sellers.map(publicSeller);
}

export async function createSeller(data) {
  const seller = await prisma.seller.create({
    data: {
      id: `seller-${randomUUID().slice(0, 8)}`,
      name: data.name,
      email: data.email,
      seller_token: `tok-${randomUUID()}`,
      location: data.location,
      country: data.country,
      flag: data.flag,
      lnbits_invoice_key: data.lnbits_invoice_key,
      payout_note: data.payout_note || "",
      total_sats_earned: 0,
    },
  });
  return serializeSeller(seller);
}

function enrichItemRecord(item, seller) {
  const serialized = serializeItem(item);
  return {
    ...serialized,
    seller_name: seller?.name ?? "Unknown",
    seller_country: seller?.country ?? "",
    seller_flag: seller?.flag ?? "🌍",
    display_image_url: getItemImageUrl(serialized),
  };
}

export async function enrichItem(item) {
  if (!item) return null;
  const seller =
    item.seller ??
    (await prisma.seller.findUnique({ where: { id: item.seller_id } }));
  return enrichItemRecord(item, seller);
}

export async function getAllItems(filters = {}) {
  const where = { active: true };

  if (filters.productType && filters.productType !== "all") {
    where.product_type = filters.productType;
  }
  if (filters.category && filters.category !== "all") {
    where.category = filters.category;
  }
  if (filters.country && filters.country !== "all") {
    where.seller = { country: filters.country };
  }

  let items = await prisma.item.findMany({
    where,
    include: { seller: true },
    orderBy: { created_at: "desc" },
  });

  if (filters.query) {
    const q = filters.query.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.seller?.name ?? "").toLowerCase().includes(q)
    );
  }

  return items.map((item) => enrichItemRecord(item, item.seller));
}

export async function getItemById(itemId) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { seller: true },
  });
  return item ? enrichItemRecord(item, item.seller) : null;
}

export async function getItemsBySeller(sellerId) {
  const items = await prisma.item.findMany({
    where: { seller_id: sellerId },
    include: { seller: true },
    orderBy: { created_at: "desc" },
  });
  return items.map((item) => enrichItemRecord(item, item.seller));
}

export async function createItem(sellerId, data) {
  const id = `item-${randomUUID().slice(0, 8)}`;
  const item = await prisma.item.create({
    data: {
      id,
      seller_id: sellerId,
      title: data.title,
      category: data.category,
      product_type: data.product_type,
      description: data.description,
      price_sats: data.price_sats,
      image_url: data.image_url || null,
      thumbnail_seed: id,
      delivery_method: data.delivery_method,
      delivery_value: data.delivery_value,
      active: true,
    },
    include: { seller: true },
  });
  return enrichItemRecord(item, item.seller);
}

export async function updateItem(itemId, sellerId, updates) {
  const existing = await prisma.item.findFirst({
    where: { id: itemId, seller_id: sellerId },
    include: { seller: true },
  });
  if (!existing) return null;

  const item = await prisma.item.update({
    where: { id: itemId },
    data: updates,
    include: { seller: true },
  });
  return enrichItemRecord(item, item.seller);
}

export async function createOrder(orderData) {
  const order = await prisma.order.create({
    data: {
      order_id: orderData.order_id,
      item_id: orderData.item_id,
      seller_id: orderData.seller_id,
      buyer_session_id: orderData.buyer_session_id,
      price_sats: orderData.price_sats,
      checking_id: orderData.checking_id,
      payment_request: orderData.payment_request,
      status: orderData.status || "PENDING",
      buyer_shipping_address: orderData.buyer_shipping_address,
      buyer_contact: orderData.buyer_contact,
      created_at: orderData.created_at
        ? new Date(orderData.created_at)
        : undefined,
      expires_at: new Date(orderData.expires_at),
      paid_at: orderData.paid_at ? new Date(orderData.paid_at) : null,
      settlement_ms: orderData.settlement_ms,
    },
  });
  return serializeOrder(order);
}

export async function getOrderById(orderId) {
  const order = await prisma.order.findUnique({ where: { order_id: orderId } });
  return order ? serializeOrder(order) : null;
}

export async function updateOrder(orderId, updates) {
  const data = { ...updates };
  if (data.paid_at) data.paid_at = new Date(data.paid_at);
  if (data.expires_at) data.expires_at = new Date(data.expires_at);
  if (data.created_at) data.created_at = new Date(data.created_at);

  try {
    const order = await prisma.order.update({
      where: { order_id: orderId },
      data,
    });
    return serializeOrder(order);
  } catch {
    return null;
  }
}

export async function getOrdersByBuyerSession(sessionId) {
  const orders = await prisma.order.findMany({
    where: { buyer_session_id: sessionId },
    orderBy: { created_at: "desc" },
  });
  return orders.map(serializeOrder);
}

export async function getOrdersBySeller(sellerId) {
  const orders = await prisma.order.findMany({
    where: { seller_id: sellerId },
    orderBy: { created_at: "desc" },
  });
  return orders.map(serializeOrder);
}

export async function markSellerEarnings(sellerId, amount) {
  await prisma.seller.update({
    where: { id: sellerId },
    data: { total_sats_earned: { increment: amount } },
  });
}

export async function enrichOrder(order) {
  const item = await prisma.item.findUnique({ where: { id: order.item_id } });
  const seller = await prisma.seller.findUnique({ where: { id: order.seller_id } });
  return {
    ...order,
    item_title: item?.title ?? "Unknown item",
    item_category: item?.category ?? "",
    product_type: item?.product_type ?? "",
    delivery_method: item?.delivery_method ?? "",
    delivery_value: item?.delivery_value ?? "",
    seller_name: seller?.name ?? "Unknown",
    seller_flag: seller?.flag ?? "🌍",
  };
}

export async function getTransactionsForBuyer(sessionId) {
  const orders = await getOrdersByBuyerSession(sessionId);
  return Promise.all(orders.map(enrichOrder));
}

export async function getTransactionsForSeller(sellerId) {
  const orders = await getOrdersBySeller(sellerId);
  return Promise.all(orders.map(enrichOrder));
}
