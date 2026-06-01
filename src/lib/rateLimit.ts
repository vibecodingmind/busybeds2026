interface RateLimitEntry {
  count: number;
  lastReset: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.lastReset > entry.lastReset + 300_000) store.delete(key);
  }
}, 300_000);

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix = 'rl' } = options;

  return (identifier: string): { allowed: boolean; remaining: number; resetAt: number } => {
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.lastReset > windowMs) {
      store.set(key, { count: 1, lastReset: now });
      return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.lastReset + windowMs };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.lastReset + windowMs };
  };
}

// Pre-configured rate limiters
export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: 'login' });
export const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: 'register' });
export const passwordResetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: 'pwreset' });
export const couponRedeemLimiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'redeem' });
export const paymentLimiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'payment' });

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}
