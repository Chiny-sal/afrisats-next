import { ITEM_ID_REGEX, ORDER_ID_REGEX, isValidCategoryForType } from "./constants";

export function sanitizeString(value, maxLen = 500) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLen) return null;
  return trimmed;
}

export function validateItemId(itemId) {
  return typeof itemId === "string" && ITEM_ID_REGEX.test(itemId);
}

export function validateOrderId(orderId) {
  return typeof orderId === "string" && ORDER_ID_REGEX.test(orderId);
}

export function validateShippingFields(shippingAddress, contact) {
  const address = sanitizeString(shippingAddress, 1000);
  const phone = sanitizeString(contact, 200);
  if (!address || !phone) {
    return { valid: false, error: "Shipping address and contact are required" };
  }
  return { valid: true, shippingAddress: address, contact: phone };
}

export function validateItemPayload(body) {
  const title = sanitizeString(body.title, 120);
  const description = sanitizeString(body.description, 500);
  const category = sanitizeString(body.category, 60);
  const productType = body.product_type;
  const deliveryMethod = body.delivery_method;
  const deliveryValue = sanitizeString(body.delivery_value, 2000);
  const priceSats = Number(body.price_sats);
  const imageUrl = typeof body.image_url === "string" ? body.image_url.trim() : "";

  if (!title) return { valid: false, error: "Title is required" };
  if (!description) return { valid: false, error: "Description is required (max 500 chars)" };
  if (!["digital", "physical"].includes(productType)) {
    return { valid: false, error: "product_type must be digital or physical" };
  }
  if (!category || !isValidCategoryForType(category, productType)) {
    return { valid: false, error: "Invalid category for product type" };
  }
  if (!Number.isInteger(priceSats) || priceSats < 1 || priceSats > 5000) {
    return { valid: false, error: "price_sats must be between 1 and 5000" };
  }

  if (productType === "digital") {
    if (!["link", "instructions"].includes(deliveryMethod)) {
      return { valid: false, error: "Digital items require delivery_method link or instructions" };
    }
    if (!deliveryValue) {
      return { valid: false, error: "delivery_value is required" };
    }
  } else {
    if (deliveryMethod !== "shipping") {
      return { valid: false, error: "Physical items must use shipping delivery" };
    }
    if (!deliveryValue) {
      return { valid: false, error: "Shipping notes are required" };
    }
  }

  return {
    valid: true,
    data: {
      title,
      description,
      category,
      product_type: productType,
      delivery_method: productType === "physical" ? "shipping" : deliveryMethod,
      delivery_value: deliveryValue,
      price_sats: priceSats,
      image_url: imageUrl,
    },
  };
}
