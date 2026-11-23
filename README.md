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
- **Home** — 16 numbered sections: scroll-scrubbed cinematic hero (image sequence on canvas), studio intro (counters + ticker), pinned horizontal project gallery, cursor-following category index, live 3D spatial experience, a draggable daylight-to-dusk light study (same camera, two renders), services with photo wipes, material library, scrubbed-text philosophy, a self-drawing architectural plan for the 7-stage process, three engagement models, studio story, team, testimonials, journal, consultation CTA, contact, photographic footer.
- **/projects** (URL-driven category filters animated with GSAP Flip, plus a typographic Index view), **/projects/[slug]** (case study: specification sheet, numbered design moves, click-to-load 3D scene, full-bleed "next project"), **/services**, **/studio**, **/materials**, **/contact**, **/journal**, **/journal/[slug]**.
- GSAP preloader, scroll-aware navbar with progress line, reading-progress bar on articles, `/privacy` and `/terms` templates.
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
