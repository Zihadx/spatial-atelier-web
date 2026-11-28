import { isIP } from "node:net";

export class BodyTooLargeError extends Error { constructor() { super("body too large"); this.name = "BodyTooLargeError"; } }

/** Reads a request body as text, rejecting anything over `maxBytes` — enforced while streaming, not just via Content-Length. */
export async function readBodyLimited(req: Request, maxBytes: number): Promise<string> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) throw new BodyTooLargeError();
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) { await reader.cancel().catch(() => {}); throw new BodyTooLargeError(); }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export const isJsonRequest = (req: Request) => (req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json");

export interface OriginPolicy {
  /** Allowed origins, e.g. "https://www.example.com". */
  allowed: ReadonlySet<string>;
  /** Browsers always send Origin on cross-site POSTs; in production a missing Origin is rejected. */
  requireOrigin: boolean;
}

/** CSRF defence for cookie-less JSON endpoints: only our own origin may POST. */
export function isOriginAllowed(origin: string | null, policy: OriginPolicy): boolean {
  if (!origin) return !policy.requireOrigin;
  return policy.allowed.has(origin);
}

/**
 * The real client IP — only from a header your own reverse proxy controls (TRUSTED_PROXY_HEADER).
 * For x-forwarded-for the client is the Nth entry from the right, N = number of trusted proxies, because everything to
 * its left is client-supplied and spoofable. Without a configured header this returns null and per-IP limiting is skipped
 * (rather than trusting a forgeable header).
 */
export function trustedClientIp(headers: Headers, header: string | undefined, hops: number): string | null {
  if (!header) return null;
  const raw = headers.get(header);
  if (!raw) return null;
  const candidate = header === "x-forwarded-for" ? raw.split(",").map((s) => s.trim()).at(-hops) : raw.trim();
  return candidate && isIP(candidate) ? candidate : null;
}
