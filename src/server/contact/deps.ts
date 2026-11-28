import { getEnv } from "@/env";
import { getBrand, getContactDestination, getSiteUrl } from "@/lib/site";
import { logger } from "../logger";
import { createMemoryRateLimiter } from "../security/rate-limit";
import { createResendMailer } from "./adapters";
import type { ContactDeps } from "./service";

const limiter = createMemoryRateLimiter(); // one per server process, shared by all requests

/** Builds production dependencies from validated env + config. Add a LeadStore here when one exists. */
export function getContactDeps(): ContactDeps {
  const env = getEnv();
  const allowed = new Set([new URL(getSiteUrl()).origin]);
  if (env.NODE_ENV !== "production") ["http://localhost:3000", "http://127.0.0.1:3000"].forEach((o) => allowed.add(o));
  return {
    brandName: getBrand().name,
    destination: getContactDestination(),
    origin: { allowed, requireOrigin: env.NODE_ENV === "production" },
    proxy: { header: env.TRUSTED_PROXY_HEADER, hops: env.TRUSTED_PROXY_HOPS },
    limiter,
    mailer: env.RESEND_API_KEY ? createResendMailer(env.RESEND_API_KEY) : undefined,
    from: env.CONTACT_FROM_EMAIL,
    logger,
  };
}
