/**
 * Single, validated source of truth for environment variables.
 * - No `@/` aliases: next.config.ts imports this file so an invalid production environment fails the build early.
 * - Server-only values (API keys) must never be read from client code; only NEXT_PUBLIC_* values may be.
 */
import { z } from "zod";

const flag = z.enum(["true", "false"]).default("false").transform((v) => v === "true");
const isLocalHost = (u: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(u.replace(/\/$/, ""));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Canonical public origin, e.g. https://www.example.com — drives canonical URLs, sitemap, Open Graph and JSON-LD. */
  NEXT_PUBLIC_SITE_URL: z.url().optional(),
  /** Where contact-form messages are delivered. Falls back to the primary email in contact.config.ts. */
  CONTACT_TO_EMAIL: z.email().optional(),
  /** "Display Name <address@verified-domain>" as accepted by the mail provider. */
  CONTACT_FROM_EMAIL: z.string().min(3).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  /** Header your reverse proxy sets with the real client IP. Unset = per-IP limiting is disabled (see ARCHITECTURE.md). */
  TRUSTED_PROXY_HEADER: z.enum(["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "x-vercel-forwarded-for"]).optional(),
  /** Number of trusted proxies appended to x-forwarded-for (the client IP is the Nth entry from the right). */
  TRUSTED_PROXY_HOPS: z.coerce.number().int().min(1).max(5).default(1),
  /** Expose the internal /render/* stage routes (used only by scripts/render-stills.mjs). Always on in development. */
  ENABLE_RENDER_ROUTES: flag,
});

export type Env = z.infer<typeof schema>;

export class EnvError extends Error {
  constructor(readonly issues: string[]) {
    super(`Invalid environment configuration:\n  - ${issues.join("\n  - ")}`);
    this.name = "EnvError";
  }
}

/** Pure and testable: validates a source object (defaults to process.env). */
export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const cleaned = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v !== ""));
  const parsed = schema.safeParse(cleaned);
  const issues: string[] = [];
  if (!parsed.success) for (const i of parsed.error.issues) issues.push(`${i.path.join(".") || "(root)"}: ${i.message}`);
  const env = parsed.success ? parsed.data : undefined;
  if (env?.NODE_ENV === "production") {
    const url = env.NEXT_PUBLIC_SITE_URL;
    if (!url) issues.push("NEXT_PUBLIC_SITE_URL: required in production (canonical URLs, sitemap, Open Graph and structured data are built from it)");
    else if (!url.startsWith("https://") && !isLocalHost(url)) issues.push("NEXT_PUBLIC_SITE_URL: must use https:// in production");
    if (url && /(^|\.)example\.(com|org|net)$/.test(new URL(url).hostname)) issues.push("NEXT_PUBLIC_SITE_URL: still set to an example.* placeholder domain");
    if (env.RESEND_API_KEY && !env.CONTACT_FROM_EMAIL) issues.push("CONTACT_FROM_EMAIL: required when RESEND_API_KEY is set");
  }
  if (issues.length || !env) throw new EnvError(issues);
  return env;
}

let cached: Env | undefined;
/** Lazily validated process.env. Throws EnvError on invalid configuration. */
export function getEnv(): Env {
  return (cached ??= parseEnv());
}
