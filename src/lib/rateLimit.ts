interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

interface RateLimitOptions {
  ip: string;
  limit?: number;
  windowMs?: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

export function rateLimit({
  ip,
  limit = 100,
  windowMs = 15 * 60 * 1000, // 15 minutes
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();

  // Periodic cleanup
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
    lastCleanup = now;
  }

  const existing = store.get(ip);

  if (!existing || now > existing.resetTime) {
    // New window
    store.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0 };
  }

  existing.count += 1;
  return { success: true, remaining: limit - existing.count };
}
