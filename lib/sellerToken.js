export function normalizeSellerToken(token) {
  return typeof token === "string" ? token.trim() : "";
}

export function getSellerTokenFromRequest(request) {
  return normalizeSellerToken(request.headers.get("x-seller-token"));
}
