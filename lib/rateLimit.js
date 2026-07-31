/**
 * Simple in-memory sliding-window rate limiter.
 * Swap for Redis/Vercel KV in production multi-instance deploys.
 */

const buckets = new Map();

function prune(key, windowMs) {
  const now = Date.now();
  const entries = buckets.get(key) || [];
  const fresh = entries.filter((t) => now - t < windowMs);
  buckets.set(key, fresh);
  return fresh;
}

export function checkRateLimit(key, maxRequests, windowMs) {
  const entries = prune(key, windowMs);
  if (entries.length >= maxRequests) {
    return { allowed: false, retryAfterMs: windowMs - (Date.now() - entries[0]) };
  }
  entries.push(Date.now());
  buckets.set(key, entries);
  return { allowed: true };
}

export function rateLimitResponse(retryAfterMs) {
  return new Response(
    JSON.stringify({
      error: `Rate limit exceeded. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
    }),
    { status: 429, headers: { "Content-Type": "application/json" } }
  );
}
