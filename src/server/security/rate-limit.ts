export interface RateRule { limit: number; windowMs: number }
export interface RateResult { limited: boolean; retryAfterSec: number }
export interface RateLimiter { hit(key: string, rule: RateRule): RateResult }

/**
 * Sliding-window limiter held in process memory. Bounded: expired entries are pruned and the key count is capped, so it
 * cannot grow without limit. Per-instance only — behind multiple instances, implement RateLimiter on a shared store.
 */
export function createMemoryRateLimiter({ maxKeys = 5000, now = Date.now }: { maxKeys?: number; now?: () => number } = {}): RateLimiter {
  const hits = new Map<string, number[]>();
  let lastSweep = 0;
  const sweep = (t: number, windowMs: number) => {
    if (t - lastSweep < 30_000 && hits.size < maxKeys) return;
    lastSweep = t;
    for (const [k, stamps] of hits) { if (stamps.length === 0 || t - stamps[stamps.length - 1] > windowMs) hits.delete(k); }
    // still over the cap (a flood of distinct keys): drop the oldest entries first
    for (const k of hits.keys()) { if (hits.size <= maxKeys) break; hits.delete(k); }
  };
  return {
    hit(key, { limit, windowMs }) {
      const t = now();
      sweep(t, windowMs);
      const stamps = (hits.get(key) ?? []).filter((s) => t - s < windowMs);
      if (stamps.length >= limit) { hits.set(key, stamps); return { limited: true, retryAfterSec: Math.max(1, Math.ceil((stamps[0] + windowMs - t) / 1000)) }; }
      stamps.push(t);
      hits.set(key, stamps);
      return { limited: false, retryAfterSec: 0 };
    },
  };
}
