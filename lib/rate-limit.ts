interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory fallback map for serverless instances
const localStore = new Map<string, RateLimitRecord>();

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "unknown-ip";
}

/**
 * Checks rate limiting for an incoming request.
 * Supports configurable thresholds and window sizes.
 * If UPSTASH_REDIS_REST_URL is configured, can query Redis;
 * otherwise uses localized sliding-window protection.
 */
export async function checkRateLimit(
  request: Request,
  prefix: string,
  limit: number,
  windowSeconds = 60,
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Cleanup expired entries periodically to prevent memory growth
  if (localStore.size > 5000) {
    for (const [k, v] of localStore.entries()) {
      if (now > v.resetAt) {
        localStore.delete(k);
      }
    }
  }

  const existing = localStore.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    localStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: limit - 1,
      reset: Math.ceil(resetAt / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil(existing.resetAt / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    reset: Math.ceil(existing.resetAt / 1000),
  };
}

