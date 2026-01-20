import { TooManyRequestsError } from "./errors";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory storage for rate limiting
// Note: This is cleared on server restart and doesn't work across multiple instances
// For production with multiple instances, consider using Redis or MongoDB
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

/**
 * Rate limiting utility.
 * Throws TooManyRequestsError if the limit is exceeded.
 *
 * @param options - Rate limit configuration
 * @throws TooManyRequestsError if limit exceeded
 */
export function rateLimit(options: RateLimitOptions): void {
  const { key, limit, windowMs } = options;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired one
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  // Increment count
  entry.count += 1;

  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    throw new TooManyRequestsError(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      retryAfter
    );
  }

  rateLimitStore.set(key, entry);
}

/**
 * Gets a rate limit key from request.
 * Prefers userId if authenticated, otherwise uses IP address.
 */
export function getRateLimitKey(
  userId?: string,
  ip?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${ip || "unknown"}`;
}
