# API contracts

Only one endpoint exists today. Do not assume others.

## `POST /api/contact`
Handles project inquiries and newsletter sign-ups. Implementation: `src/server/contact/service.ts`. Shared types: `src/lib/contact-schema.ts`.

### Request
Headers: `Content-Type: application/json` (required). `Origin` must be the site's own origin (`NEXT_PUBLIC_SITE_URL`); in production a missing `Origin` is rejected. Body ≤ 16 KB.

```jsonc
{
  "kind": "inquiry" | "newsletter",   // default "inquiry"
  "name": "string 2–120",             // optional
  "email": "valid email ≤ 200",       // required
  "type": "string ≤ 80",              // optional (project type)
  "budget": "string ≤ 80",            // optional
  "location": "string ≤ 160",         // optional
  "message": "string ≤ 4000",         // optional
  "company": "string"                 // honeypot: leave empty. Non-empty ⇒ fake success, nothing is sent
}
```
Unknown fields are rejected (`422`).

### Responses
Always `Cache-Control: no-store`.

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ "ok": true, "delivered": true }` | Message was handed to the mail provider (or honeypot, see above) |
| 200 | `{ "ok": true, "delivered": false }` | Accepted but **not delivered**: no mail provider is configured. Clients must tell the user to use the studio email |
| 400 | `{ "ok": false, "code": "bad_request", "error": … }` | Unreadable body / invalid JSON |
| 403 | `code: "invalid_origin"` | Foreign or missing `Origin` |
| 413 | `code: "payload_too_large"` | Body over 16 KB |
| 415 | `code: "unsupported_media_type"` | Not `application/json` |
| 422 | `code: "validation_failed"` | Schema violation (generic message, no field details) |
| 429 | `code: "rate_limited"` + `Retry-After` (seconds) | Too many requests for this address / IP / globally |
| 502 | `code: "delivery_failed"` | Mail provider failed; no provider detail is returned |

`error` is always a short, user-safe string. Other methods return `405`.

### Rate limits (defaults, `DEFAULT_RULES`)
Per submitting email 3 / 10 min · per client IP 6 / 10 min (only with `TRUSTED_PROXY_HEADER`) · global 120 / 10 min.

## Extension points for a backend developer
| Interface | File | Purpose |
|---|---|---|
| `Mailer` | `server/contact/adapters.ts` | Send the message (default: Resend over `fetch`) |
| `LeadStore` | `server/contact/adapters.ts` | Persist leads before mailing (none bundled) |
| `RateLimiter` | `server/security/rate-limit.ts` | Swap the in-memory limiter for a shared store |
| `ContentSource` | `content/source.ts` | Read content from a CMS/database |

Wire new implementations in `server/contact/deps.ts` (contact) or `content/index.ts` (content).

## Planned, not implemented
Authentication, an admin/CMS, a database and any content-editing endpoints do not exist. Nothing in the UI pretends otherwise.
