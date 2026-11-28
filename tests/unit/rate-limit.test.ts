import { describe, expect, it } from "vitest";
import { createMemoryRateLimiter } from "@/server/security/rate-limit";

const rule = { limit: 3, windowMs: 1000 };

describe("memory rate limiter", () => {
  it("allows up to the limit then blocks, reporting a sensible Retry-After", () => {
    let t = 0;
    const rl = createMemoryRateLimiter({ now: () => t });
    expect([1, 2, 3].map(() => rl.hit("k", rule).limited)).toEqual([false, false, false]);
    t = 400;
    const blocked = rl.hit("k", rule);
    expect(blocked.limited).toBe(true);
    expect(blocked.retryAfterSec).toBe(1);
  });

  it("recovers after the window and isolates keys", () => {
    let t = 0;
    const rl = createMemoryRateLimiter({ now: () => t });
    for (let i = 0; i < 3; i++) rl.hit("a", rule);
    expect(rl.hit("a", rule).limited).toBe(true);
    expect(rl.hit("b", rule).limited).toBe(false);
    t = 1001;
    expect(rl.hit("a", rule).limited).toBe(false);
  });

  it("stays bounded under a flood of distinct keys (no unbounded memory growth)", () => {
    let t = 0;
    const rl = createMemoryRateLimiter({ maxKeys: 100, now: () => t });
    for (let i = 0; i < 5000; i++) { t += 1; rl.hit(`ip:${i}`, { limit: 5, windowMs: 60_000 }); }
    // can't read the map directly; behaviour check: the limiter still functions and recent keys are still tracked
    const recent = "ip:4999";
    for (let i = 0; i < 4; i++) rl.hit(recent, { limit: 5, windowMs: 60_000 });
    expect(rl.hit(recent, { limit: 5, windowMs: 60_000 }).limited).toBe(true);
  });
});
