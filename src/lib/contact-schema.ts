/** Shared contact payload contract — used by the browser forms and validated again on the server. */
import { z } from "zod";

export const CONTACT_LIMITS = { name: 120, email: 200, type: 80, budget: 80, location: 160, message: 4000 } as const;

export const contactPayloadSchema = z.object({
  kind: z.enum(["inquiry", "newsletter"]).default("inquiry"),
  name: z.string().trim().min(2).max(CONTACT_LIMITS.name).optional(),
  email: z.string().trim().email().max(CONTACT_LIMITS.email),
  type: z.string().trim().max(CONTACT_LIMITS.type).optional(),
  budget: z.string().trim().max(CONTACT_LIMITS.budget).optional(),
  location: z.string().trim().max(CONTACT_LIMITS.location).optional(),
  message: z.string().trim().max(CONTACT_LIMITS.message).optional(),
  /** Honeypot: real users never fill this. Accepted by the schema on purpose so the server can fake success (rejecting it would tell bots what tripped them). */
  company: z.string().max(500).optional(),
}).strict();

export type ContactPayload = z.infer<typeof contactPayloadSchema>;

export type ContactErrorCode = "invalid_origin" | "unsupported_media_type" | "payload_too_large" | "bad_request" | "validation_failed" | "rate_limited" | "delivery_failed";
export type ContactResponse = { ok: true; delivered: boolean } | { ok: false; error: string; code: ContactErrorCode };
