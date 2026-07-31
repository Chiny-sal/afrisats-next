import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "afrisats_session";

export function getBuyerSessionId(request) {
  const headerSession = request.headers.get("x-buyer-session");
  if (headerSession) return headerSession;

  const cookieStore = cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  return null;
}

export function createBuyerSessionId() {
  return `buyer-${randomUUID()}`;
}

export function sessionCookieOptions(sessionId) {
  return {
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
