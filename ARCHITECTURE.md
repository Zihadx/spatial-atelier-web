# Architecture

## Principles
1. **One source for each fact.** Site-wide information lives in `src/config`; editorial content behind `src/content`. Components never hardcode the brand name, contact details, locations or navigation.
2. **Pages are server components that fetch; components render.** Client components (GSAP, forms, 3D) receive plain data as props.
3. **No fake backend.** Where infrastructure does not exist (database, CMS, durable lead storage) there is an interface and an honest default, not a simulation.

## Configuration layer (`src/config`, `src/lib/site.ts`, `src/env.ts`)
| File | Holds |
|---|---|
| `brand.config.ts` | name, wordmark parts (`Atelier` / `Verre`), tagline, description, logo, theme colour |
| `contact.config.ts` | emails, phones (E.164 + display), WhatsApp, social links, form budget bands |
| `locations.config.ts` | studio / showroom locations with hours, timezone, phone reference, `isMock` |
| `navigation.config.ts` | main and footer navigation |
| `site.config.ts` | locale, SEO defaults, robots disallow list, sitemap pages, project note |
| `schema.ts` | the zod schemas; every config file is **parsed at import**, so invalid data fails fast |

`lib/site.ts` is the access layer (`getBrand()`, `getContact()`, `getLocations()`, `getPrimaryLocation()`, `absoluteUrl()`, `getMockInventory()` …). `lib/contact-links.ts` has pure helpers (`telHref`, `whatsappHref`, `formatHours`, `formatAddress`) that are safe in client code. `lib/chrome.ts` assembles a serializable `ChromeData` object that the server `SiteChrome` passes to the client navbar, menu, footer and preloader.

`src/env.ts` validates environment variables (zod) and is imported by `next.config.ts`, so a bad production environment fails the build.

**Mock data.** Placeholder values carry `isMock: true`. Policy (tested): mock contact details and mock locations are never emitted as JSON-LD; invented people are never named or pictured; addresses are area-level only until real.

## Content layer (`src/content`)
`ContentSource` (in `source.ts`) is the seam between the UI and wherever content lives:

```ts
getProjects / getProject(slug) / getCategories
getServices / getServiceMethod / getFaq
getArticles / getArticle(slug)
getMaterials / getMaterialPairings
getStudio()   // philosophy, process, values, team, testimonials
```
`static/` implements it from files in the repo. `getContent()` returns the active source; `validate.ts` checks shapes and cross-references (unique slugs, project → category/material ids) and runs in the unit tests.

**Moving to a CMS or database (Sanity, Payload, Supabase …):** implement `ContentSource`, map the provider's documents to the types in `content/types.ts`, return it from `getContent()`. Pages already call these methods and pass data down, so no component changes are needed. Implementations should throw on failure (Next's error boundary handles it) and return `null` for "not found". Run `validateContent()` against the new adapter in tests.

**Engine registries stay in code.** Material shader properties (`data/materials.ts`), 3D scene presets (`data/projects.ts` → `preset`), render specs and frame manifests are coupled to textures and shaders and are read synchronously by the 3D components. A CMS can own the *descriptive* fields; the registries are merged by id. This boundary is deliberate.

## Contact pipeline (`src/server`)
`app/api/contact/route.ts` is a thin wrapper. `server/contact/service.ts` `handleContactRequest(req, deps)` is pure with respect to injected dependencies (`Mailer`, `LeadStore`, `RateLimiter`, logger, origin policy), which is what makes it unit-testable. Order of checks: origin → JSON content type → body size (streamed, 16 KB) → parse → zod → rate limits → honeypot → (store) → mail. Contract: `API_CONTRACTS.md`.

| Concern | Implementation |
|---|---|
| CSRF | Only configured origins; a missing `Origin` is rejected in production; JSON only (`text/plain` "simple requests" rejected) |
| Abuse | Per-email (3 / 10 min), per-IP (6 / 10 min, **only** with a trusted proxy header), global breaker (120 / 10 min) |
| IP trust | `TRUSTED_PROXY_HEADER` + `TRUSTED_PROXY_HOPS`; for `x-forwarded-for` the client is the Nth entry from the right. Never trusts a header you did not configure |
| Header injection | control characters stripped from every value that reaches a subject or header |
| Information leakage | generic client messages; provider errors only in structured logs, never PII |

## Security
**Done:** CSP and standard headers; HSTS in production; origin/CSRF checks; request size cap; bounded rate limiter; escaped JSON-LD; env validation; internal `/render` routes 404 in production; immutable caching only for content-hashed assets; `suppressHydrationWarning` on `<body>` for extension-injected attributes; no secrets in client bundles (only `NEXT_PUBLIC_*` is client-readable).

**Needs your infrastructure / decisions**
- **Rate limiter is per instance.** Behind several instances or serverless, implement `RateLimiter` on a shared store (Redis/KV) in `server/contact/deps.ts`.
- **No durable lead store.** If mail fails the lead is lost (the user is told to email). Implement `LeadStore` (database/CRM/queue) and pass it in `getContactDeps()`.
- **CSP allows inline scripts** (`'unsafe-inline'`) because Next's bootstrap is inline; a nonce-based CSP would force every page to render dynamically. `'wasm-unsafe-eval'` is required by the meshopt model decoder. `'unsafe-eval'` is dev-only.
- **Zod runs in jitless mode on the client** (`lib/zod-client.ts`) because JIT uses `new Function`, which the CSP forbids.
- Authentication/authorization does not exist yet (there is no admin). When a CMS or admin is added, put it behind the provider's auth; do not build session handling into this site.
- Dependency advisories: `npm audit --omit=dev` is clean today and runs in CI.

## Motion & 3D
- **Frame sequences** (hero, design process): `lib/image-sequence.ts` (loader, cover maths, motion-curve remap) + `hero/ImageSequenceCanvas.tsx`. Frames load by priority (poster → key-frames → window around the playhead), bounded memory, retry-then-skip; the render loop idles when nothing changes and uses no React state. Built by `scripts/build-*-sequence.mjs`; manifests (`src/data/*-sequence.json`) carry a content `version` used as `?v=` so frames are cached as immutable.
- **WebGL scenes**: code-split, poster-first, adaptive quality (`components/three`).
- Scroll reveals use opacity only so content is never removed from the accessibility tree.

## Accessibility
Automated axe checks (WCAG 2 A/AA) run in Playwright on every page at desktop and mobile sizes. Accent colours have darker "ink" variants on light surfaces (`.surface-warm`, `.surface-sand`) to reach 4.5:1; dark surfaces use the brighter tokens. Reduced motion: static poster, no loader, per-stage stills in the process section. Automated checks cover only part of WCAG: keyboard and screen-reader walk-throughs on real devices are still recommended.

## Testing strategy
Unit tests for logic with security or architectural consequences; Playwright against the *production* build for behaviour, headers, CSP and accessibility. See README → Testing.
