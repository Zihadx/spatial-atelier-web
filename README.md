# Atelier Verre — The Living Space

An immersive, 3D-driven luxury interior design website (concept). Next.js 16 App Router · React 19 · TypeScript (strict) · Tailwind CSS 4 · Three.js / React Three Fiber / drei · GSAP + ScrollTrigger + SplitText · Motion · Lenis · React Hook Form + Zod.

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck
npm run build && npm start
```

## What is in the site
- **Home** — 16 numbered sections: scroll-driven 3D hero, studio intro (counters + ticker), pinned horizontal project gallery, cursor-following category index, live 3D spatial experience, a draggable daylight-to-dusk light study (same camera, two renders), services with photo wipes, material library, scrubbed-text philosophy, a self-drawing architectural plan for the 7-stage process, three engagement models, studio story, team, testimonials, journal, consultation CTA, contact, photographic footer.
- **/projects** (URL-driven category filters animated with GSAP Flip, plus a typographic Index view), **/projects/[slug]** (case study: specification sheet, numbered design moves, click-to-load 3D scene, full-bleed "next project"), **/services**, **/studio**, **/materials**, **/contact**, **/journal**, **/journal/[slug]**.
- GSAP preloader, scroll-aware navbar with progress line, reading-progress bar on articles, `/privacy` and `/terms` templates.
- Sitemap, robots, per-route metadata and Open Graph, skip link, focus states, reduced-motion support, adaptive 3D quality, WebGL detection.

## Performance model (3D is used selectively)
- Only **four** WebGL canvases exist, all code-split (`next/dynamic`, `ssr:false`): the **hero** (mounts on browser idle, never on Save-Data/reduced motion; a priority poster paints first), the **spatial room** and the **project viewer** (poster-first: the 3D downloads only when the visitor clicks), and the **material sample viewer** (mounts near the viewport, unmounts after leaving).
- Everything else is photography, SVG or CSS driven by GSAP (transform/opacity/clip-path only).
- GLB models were compressed with meshopt + WebP textures (about 21 MB to 1.7 MB).
- Photos are served by Unsplash's CDN through a custom `next/image` loader (resized, AVIF/WebP negotiated by Unsplash).

## Photography (important)
All remote photos live in one file: `src/data/photos.ts`. **The Unsplash photo IDs were chosen without being able to open Unsplash from the build environment, so they are unverified.** Open each one, confirm it fits the slot, and swap IDs as needed. Every slot has a local 3D-render fallback that is used automatically if the remote image fails. Credit Unsplash photographers where appropriate.

## Other honest notes
- Local imagery is **3D renders** of this site's own scenes (`scripts/render-stills.mjs`, `scripts/derive-images.mjs`) and **generated texture studies** (`scripts/generate-textures.mjs`, `scripts/generate-plates.mjs`) — not photographs.
- 3D models are Khronos glTF-Sample-Assets (CC-BY 4.0 — attribution required, see `ASSETS.md`).
- Projects, team, testimonials, FAQ answers, address, phone and email are **placeholders / concept content** and labelled as such.
- **The contact form is not connected to a backend** (validation + demo message only).
- shadcn/ui and Redux Toolkit are not used (not needed); post-processing omitted for performance.
- `/render/[id]` is a noindex helper route for the still-render script.

## Structure
`src/app` routes · `src/components/{layout,home,projects,services,materials,contact,ui,three}` · `src/data` content · `src/lib` animation, camera, WebGL helpers · `scripts` asset generators.

## Motion system
GSAP owns scroll choreography (one ticker shared with Lenis); Motion handles interface transitions (menu, page enter, testimonials, filters). Shared easing: `expo.out` reveals, `power3.out` entrances. Everything is cleaned up through `useGSAP` scopes and reverted SplitText instances.

## Production checklist
1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL`. To receive form submissions set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (Resend). Without them the forms say email delivery is not set up and point visitors to the studio email. `/api/contact` has a honeypot, validation and an in-memory rate limit (use a shared store such as Upstash for multi-instance deployments).
2. Verify every photo in `src/data/photos.ts` (IDs are unverified) and replace placeholders: studio email/phone/address in `src/lib/constants.ts`, team, testimonials, FAQ, budget ranges, projects.
3. Have counsel complete `/privacy` and `/terms`; add attribution for the CC-BY 3D models (`ASSETS.md`).
4. Deploy (Vercel recommended): `npm run build`. Security headers and caching are set in `next.config.ts`; add a Content-Security-Policy once third-party sources are final.
5. Run Lighthouse on the deployed URL and tune; test real devices for the pinned sections (home gallery, process).
