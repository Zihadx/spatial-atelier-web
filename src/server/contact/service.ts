import { randomUUID } from "node:crypto";
import { contactPayloadSchema, type ContactErrorCode, type ContactResponse } from "@/lib/contact-schema";
import type { Logger } from "../logger";
import { createMemoryRateLimiter, type RateLimiter, type RateRule } from "../security/rate-limit";
import { BodyTooLargeError, isJsonRequest, isOriginAllowed, readBodyLimited, trustedClientIp, type OriginPolicy } from "../security/request";
import type { LeadStore, Mailer } from "./adapters";
import { buildMessage } from "./message";

export const MAX_BODY_BYTES = 16 * 1024;
const TEN_MIN = 10 * 60 * 1000;
export const DEFAULT_RULES = {
  /** Per real client IP — only applied when a trusted proxy header is configured. */
  ip: { limit: 6, windowMs: TEN_MIN } satisfies RateRule,
  /** Per submitting address, so one inbox cannot be flooded. */
  email: { limit: 3, windowMs: TEN_MIN } satisfies RateRule,
  /** Circuit breaker across all visitors; high enough that normal traffic never reaches it. */
  global: { limit: 120, windowMs: TEN_MIN } satisfies RateRule,
};

export interface ContactDeps {
  brandName: string;
  destination: string;
  origin: OriginPolicy;
  proxy: { header?: string; hops: number };
  limiter: RateLimiter;
  rules?: typeof DEFAULT_RULES;
  mailer?: Mailer;
  from?: string;
  store?: LeadStore;
  logger: Logger;
}

const MESSAGES: Record<ContactErrorCode, string> = {
  invalid_origin: "This request was not allowed.",
  unsupported_media_type: "Invalid request.",
  payload_too_large: "Your message is too long.",
  bad_request: "Invalid request.",
  validation_failed: "Please check the form and try again.",
  rate_limited: "Too many requests. Please try again later.",
  delivery_failed: "We could not send your message. Please email us directly.",
};
const STATUS: Record<ContactErrorCode, number> = { invalid_origin: 403, unsupported_media_type: 415, payload_too_large: 413, bad_request: 400, validation_failed: 422, rate_limited: 429, delivery_failed: 502 };

const json = (body: ContactResponse, status = 200, extra: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...extra } });
const fail = (code: ContactErrorCode, extra: Record<string, string> = {}) => json({ ok: false, error: MESSAGES[code], code }, STATUS[code], extra);

/** Handles one POST to the contact endpoint. Pure with respect to its dependencies, so it is fully unit-testable. */
export async function handleContactRequest(req: Request, deps: ContactDeps): Promise<Response> {
  const { logger } = deps;
  const rules = deps.rules ?? DEFAULT_RULES;

  if (!isOriginAllowed(req.headers.get("origin"), deps.origin)) { logger.warn("contact.rejected", { reason: "origin" }); return fail("invalid_origin"); }
  if (!isJsonRequest(req)) return fail("unsupported_media_type");

  let raw: string;
  try { raw = await readBodyLimited(req, MAX_BODY_BYTES); }
  catch (e) { return e instanceof BodyTooLargeError ? fail("payload_too_large") : fail("bad_request"); }
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return fail("bad_request"); }
  const parsed = contactPayloadSchema.safeParse(data);
  if (!parsed.success) return fail("validation_failed");
  const d = parsed.data;

  const ip = trustedClientIp(req.headers, deps.proxy.header, deps.proxy.hops);
  const checks = [
    deps.limiter.hit("global", rules.global),
    ...(ip ? [deps.limiter.hit(`ip:${ip}`, rules.ip)] : []),
    deps.limiter.hit(`email:${d.email.toLowerCase()}`, rules.email),
  ];
  const blocked = checks.find((c) => c.limited);
  if (blocked) { logger.warn("contact.rate_limited", { kind: d.kind }); return fail("rate_limited", { "Retry-After": String(blocked.retryAfterSec) }); }

  if (d.company) { logger.info("contact.honeypot"); return json({ ok: true, delivered: true }); } // bots get a fake success

  const id = randomUUID();
  if (deps.store) {
    try { await deps.store.save({ id, receivedAt: new Date().toISOString(), kind: d.kind, payload: d }); }
    catch { logger.error("contact.store_failed", { id }); }
  }
  if (!deps.mailer || !deps.from) {
    logger.warn("contact.not_delivered", { id, kind: d.kind, reason: "mail provider not configured", stored: Boolean(deps.store) });
    return json({ ok: true, delivered: false });
  }
  try {
    await deps.mailer.send({ ...buildMessage(d, deps.brandName), to: deps.destination, from: deps.from });
    logger.info("contact.delivered", { id, kind: d.kind });
    return json({ ok: true, delivered: true });
  } catch {
    logger.error("contact.delivery_failed", { id, kind: d.kind });
    return fail("delivery_failed");
  }
}

export { createMemoryRateLimiter };
