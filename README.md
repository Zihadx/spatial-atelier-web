# Atelier Verre — The Living Space

A luxury interior-design website with a scroll-scrubbed cinematic hero, a 3D design-process stage and interactive 3D rooms and materials. Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Three.js / React Three Fiber · GSAP · Zod · Vitest · Playwright.

## Quick start

Requires **Node 22** (`.nvmrc`). Commands use npm because the committed lockfile is `package-lock.json`; if you prefer pnpm, run `pnpm install` locally but keep **one** lockfile in git.

```bash
npm install
cp .env.example .env.local     # optional in development, see "Environment"
npm run dev                    # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server (Turbopack). `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000`. |
| `npm run check` | Type-check, lint and unit tests — run before every push. |
| `npm test` / `npm run test:watch` | Vitest unit tests (`tests/unit`). |
| `npm run test:e2e` | Playwright against a **production** build (`tests/e2e`). First run: `npx playwright install chromium`. |
| `NEXT_PUBLIC_SITE_URL=https://your-domain npm run build && npm start` | Production build. **Fails if `NEXT_PUBLIC_SITE_URL` is missing or invalid.** |

PowerShell: `$env:NEXT_PUBLIC_SITE_URL="https://your-domain"; npm run build`.

## Environment

All variables are validated in one place, `src/env.ts`; an invalid production environment fails `next build` / `next start` with a clear message. See `.env.example` for every variable.

| Variable | Needed | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | production | Canonical origin (https). Drives canonical URLs, sitemap, Open Graph, structured data and the contact API's allowed origin. |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` | to receive form mail | Server-side only. Without them the form still validates and the API answers `delivered:false`; the UI then points visitors to the studio email. |
| `CONTACT_TO_EMAIL` | optional | Overrides the primary email in `contact.config.ts`. |
| `TRUSTED_PROXY_HEADER`, `TRUSTED_PROXY_HOPS` | recommended behind a proxy | Enables per-IP rate limiting from a header **your** proxy controls (e.g. `x-forwarded-for` on Vercel). |
| `ENABLE_RENDER_ROUTES` | tooling only | Exposes `/render/*` (needed only to run `npm run render:stills` against a production build). Always on in development. |

## Where things live

```
src/config/     Typed, zod-validated site information (brand, contact, locations, navigation, SEO)
src/lib/site.ts The only place components read that information from (plus lib/contact-links.ts helpers)
src/content/    ContentSource interface + static adapter (projects, services, journal, studio, materials)
src/server/     Contact service: origin/size checks, rate limiting, mail + lead-store adapters
src/app/        Routes, metadata (lib/seo.ts), API route (thin wrapper over src/server)
src/components/ UI; client components get data as props from server pages
tests/          unit (Vitest) and e2e (Playwright)
```

Read **ARCHITECTURE.md** for the reasoning and **API_CONTRACTS.md** for the contact endpoint contract.

### Changing site information (no component edits)
Edit `src/config/*.config.ts`: brand name and wordmark, tagline, email, phones, WhatsApp, social links, locations and hours, navigation, SEO defaults. Everything that shows them (header, menu, footer, contact page, metadata, manifest, sitemap, structured data) updates. Phone numbers are stored in E.164 (`+8801304610108`) with a separate display string.

### Mock data and the launch checklist
Placeholder data is flagged `isMock` in config and content, and `getMockInventory()` (in `src/lib/site.ts`) lists what still needs replacing. Currently mock: the contact email and phone, both locations (Gulshan Studio, Dhanmondi Showroom — area-level only, no street address), the form's budget bands, FAQ answers, team roles and testimonials. Policy, enforced by tests: **mock contact details and locations are never emitted as structured data**, and invented people are never named or pictured. To go live, replace the values, set `isMock: false`, and fill `addressLines` / `geo`.

## What is in the site
- **Home** — 16 numbered sections: scroll-scrubbed cinematic hero (image sequence on canvas), studio intro (counters + ticker), pinned horizontal project gallery, cursor-following category index, live 3D spatial experience, a draggable daylight-to-dusk light study (same camera, two renders), services with photo wipes, material library, scrubbed-text philosophy, a self-drawing architectural plan for the 7-stage process, three engagement models, studio story, team, testimonials, journal, consultation CTA, contact, photographic footer.
- **/projects** (URL-driven category filters animated with GSAP Flip, plus a typographic Index view), **/projects/[slug]** (case study: specification sheet, numbered design moves, click-to-load 3D scene, full-bleed "next project"), **/services**, **/studio**, **/materials**, **/contact**, **/journal**, **/journal/[slug]**.
- GSAP preloader, scroll-aware navbar with progress line, reading-progress bar on articles, `/privacy` and `/terms` pages describing what the site actually does.
- Sitemap, robots, per-route metadata and Open Graph, skip link, focus states, reduced-motion support, adaptive 3D quality, WebGL detection.

## Performance model (3D is used selectively)
- Only **three** WebGL canvases exist now, all code-split (`next/dynamic`, `ssr:false`): the **spatial room** and the **project viewer** (poster-first: the 3D downloads only when the visitor clicks), and the **material sample viewer** (mounts near the viewport, unmounts after leaving).
- Everything else is photography, SVG or CSS driven by GSAP (transform/opacity/clip-path only).
- GLB models were compressed with meshopt + WebP textures (about 21 MB to 1.7 MB).
- Photos are served by Unsplash's CDN through a custom `next/image` loader (resized, AVIF/WebP negotiated by Unsplash).

## Photography (important)
All remote photos live in one file: `src/data/photos.ts`. **The Unsplash photo IDs were chosen without being able to open Unsplash from the build environment, so they are unverified.** Open each one, confirm it fits the slot, and swap IDs as needed. Every slot has a local 3D-render fallback that is used automatically if the remote image fails. Credit Unsplash photographers where appropriate.

## Cinematic hero (image sequence)
The hero is a scroll-scrubbed camera move through a living room, rendered from a numbered frame sequence on a 2D canvas (no autoplay video, no WebGL).
- **Server/client split:** `components/home/HeroSection.tsx` is a Server Component (single `h1`, copy, links, `<figure>` poster with alt text, live status region). `hero/HeroMotion.tsx` (GSAP + ScrollTrigger) and `hero/ImageSequenceCanvas.tsx` are the only client code.
- **Engine:** `lib/image-sequence.ts` — prioritised loader (poster frame → key-frames across the whole journey → a window around the playhead, biased in the scroll direction), concurrency limit, retry then skip for failed frames, bounded memory (key-frames + window kept as decoded bitmaps, the rest released), nearest-loaded-frame fallback so the canvas is never blank. The render loop runs only while something changes and uses no React state.
- **Assets:** `node scripts/build-hero-sequence.mjs <folder-of-numbered-frames>` discovers real filenames, validates numbering, and writes `public/hero/sequence/lg` (1920 px, every frame) and `sm` (1280 px, every 2nd frame) as WebP plus `src/data/hero-sequence.json`. To change the footage, rerun it — no code changes.
- **Responsive:** desktop-class screens use `lg`; phones, tablets, coarse pointers and Save-Data use `sm`. Portrait/narrow viewports crop the 16:9 footage and pan from the table to the hearth (`panRange`); the poster's CSS (`.hero-poster`) uses the same starting focal point.
- **Fallbacks:** reduced motion → static poster, one screen tall, no loader. Frames failing → status `error`, scroll runway collapses, poster and copy remain.
- **Pacing:** section height is `450svh` (desktop) / `360svh` (mobile); the sticky stage is pinned while a single scrubbed timeline drives the text states and progress rail.
- The old WebGL `HeroCanvas` (`components/three/canvases.tsx`) is no longer mounted; it can be deleted.

## Design Process (3D scroll stage)
`components/home/DesignProcess.tsx` pins the section and scrubs a frame sequence of a luxury home assembling from seven floating platforms; `components/home/process/ProcessStage.tsx` is the canvas panel. It reuses the hero's engine (`lib/image-sequence.ts`, `hero/ImageSequenceCanvas.tsx`).
- **Assets:** `node scripts/build-process-sequence.mjs <folder> [--grade=sand|none]` → `public/process/sequence/{lg,sm}` (1600 px / 1000 px WebP) + `src/data/process-sequence.json`. The supplied render had a saturated pink backdrop; `--grade=sand` (default) shifts only low-saturation pinks toward warm sand (timber, planting, glass and lighting are untouched). Use `--grade=none` for the original colours.
- **Time curve:** the footage eases in/out, so the manifest stores a cumulative motion curve and scroll maps to *visible* progress (`progressToFrame`), keeping all seven stages equally eventful. Stage notes in `DesignProcess.tsx` (`STAGE_NOTES`) describe what the model shows in each stage; if you swap the footage, re-read the "stage boundaries" line the build prints and update them.
- **Loading:** the canvas mounts only within two viewports of the section (IntersectionObserver) and releases its frames when far away; the poster is served directly so it never waits on the image optimizer.
- **Overlays:** the "Brief reference" inset (`/images/architecture/spatial.jpg`) shows in stage 01; six callouts fade in on the finished home (positions are fractions of the footage's own 16:9 framing, so they are hidden below `sm` where the panel is cropped to 4:3).
- **Reduced motion / failure:** no canvas; each stage shows its own still.

## Selected Work rail
`FeaturedProjects.tsx`: ≥1024 px keeps the pinned horizontal GSAP gallery. Below that it is a native scroll-snap rail (`snap-x`, cards `76vw` so the next one peeks), with the counter and hairline driven from `scrollLeft` (DOM writes only).

## Material realism pass (Nov 2026)
- Timber floors use dedicated **plank textures** (`walnut_floor`, `oak_floor`: ~0.2 m boards, per-board tone, staggered end joints, grooved seams, seamless tiling). Furniture timber uses a separate tight-grain texture. Travertine has horizontal strata and elongated voids. All regenerate with `node scripts/generate-textures.mjs [name]`.
- Props: lit drum lamp shades, rugs with thickness, painted abstract wall art (canvas texture, disposed on unmount).
- After changing textures or scenes, re-run: `node scripts/render-stills.mjs all`, `node scripts/derive-images.mjs`, `node scripts/generate-plates.mjs` (site running locally) so the pre-rendered posters and cards match.


## Testing

- **Unit (`npm test`, ~73 tests):** env validation, config integrity (E.164, locations, wordmark), link/hours formatting, SEO and JSON-LD policy, content integrity and cross-references, the contact pipeline (origin, content-type, body size, rate limits incl. spoofed `X-Forwarded-For`, honeypot, mail failure, header-injection), and the frame-sequence engine (priority, bounded memory, failure handling).
- **End-to-end (`npm run test:e2e`):** every page for one `h1`, per-page SEO tags, no console errors and **no CSP violations**; navigation; config reaching the UI; the contact form and API attack cases; security headers and immutable caching; `/render` gated; hero and process stage behaviour incl. reduced motion; the mobile project rail; axe WCAG 2 A/AA on every page at desktop and mobile sizes.
- **CI:** `.github/workflows/ci.yml` runs types, lint, unit tests, `npm audit` (production deps, high+), a production build and the Playwright suite.
- Environments that cannot download Playwright's browser can point `PW_CHROMIUM_PATH` at any compatible Chromium.

## Security notes

Implemented: Content-Security-Policy and standard headers (`next.config.ts`); same-origin + JSON-only + 16 KB-capped contact API; pruned in-memory rate limiter keyed on a trusted proxy IP and the submitting address; escaped JSON-LD; no secrets in client code; validated env. Limitations that depend on your infrastructure are listed in **ARCHITECTURE.md → Security**, notably: the rate limiter is per-instance, the CSP allows inline scripts (Next's bootstrap), and there is no durable lead store until you implement the `LeadStore` adapter.

## Other honest notes
- Local imagery is **3D renders** of this site's own scenes (`scripts/render-stills.mjs`, `scripts/derive-images.mjs`; run with `ENABLE_RENDER_ROUTES=true` against a production build) and **generated texture studies** (`scripts/generate-textures.mjs`, `scripts/generate-plates.mjs`) — not photographs.
- 3D models are Khronos glTF-Sample-Assets (CC-BY 4.0 — attribution required, see `ASSETS.md`).
- Projects are concept studies; project pages say so.
- shadcn/ui and Redux Toolkit are not used (not needed); post-processing omitted for performance.

## Motion system
GSAP owns scroll choreography (one ticker shared with Lenis); Motion handles interface transitions (menu, page enter, testimonials, filters). Shared easing: `expo.out` reveals, `power3.out` entrances. Scroll reveals use opacity only (never `visibility`) so content stays in the accessibility tree and Tab order. Everything is cleaned up through `useGSAP` scopes and reverted on unmount.

## Production checklist
1. Set `NEXT_PUBLIC_SITE_URL`; for form delivery set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (and `CONTACT_TO_EMAIL`); behind a proxy set `TRUSTED_PROXY_HEADER`.
2. Replace mock data (see "Mock data and the launch checklist") and verify every photo in `src/data/photos.ts` (the Unsplash IDs are unverified).
3. Have counsel review `/privacy` and `/terms` (they describe current behaviour and carry a "pending legal review" line); keep the CC-BY attribution (`ASSETS.md`).
4. Decide on a durable lead store and a shared rate-limit store for multi-instance hosting (ARCHITECTURE.md).
5. Run Lighthouse on the deployed URL and test the pinned sections (home gallery, process) on real mid-range phones.
