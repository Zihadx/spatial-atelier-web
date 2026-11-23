import Image from "next/image";
import type { CSSProperties } from "react";
import Button from "@/components/ui/Button";
import RevealText from "@/components/ui/RevealText";
import manifest from "@/data/hero-sequence.json";
import { frameUrl, type SequenceSet } from "@/lib/image-sequence";
import HeroMotion from "./hero/HeroMotion";

const pick = (s: SequenceSet): SequenceSet => ({ count: s.count, width: s.width, height: s.height, pad: s.pad, dir: s.dir });
const SETS = { lg: pick(manifest.sets.lg), sm: pick(manifest.sets.sm) };

const POSTER_ALT =
  "A sunlit living room: a curved ivory bouclé sofa, a sculptural bronze coffee table on a round charcoal rug, and a fluted walnut wall with a long linear fireplace, beside floor-to-ceiling windows.";

/**
 * Cinematic hero. The scroll-scrubbed footage is a progressive enhancement over a static, server-rendered poster:
 * without JavaScript, with reduced motion, or if the frames fail, the poster and all copy remain fully usable.
 * Static markup lives here (server); the canvas, scroll mapping and text choreography live in <HeroMotion />.
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      data-seq="loading"
      style={{ "--hp": 0 } as CSSProperties}
      className="group/hero relative h-[360svh] bg-espresso md:h-[450svh] [@media(prefers-reduced-motion:reduce)]:!h-svh"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <figure className="absolute inset-0 m-0">
          <Image
            src={frameUrl(SETS.lg, 0)}
            alt={POSTER_ALT}
            fill
            priority
            quality={72}
            sizes="100vw"
            className="hero-poster object-cover"
          />
          <HeroMotion sets={SETS} />
          <figcaption className="pointer-events-none absolute bottom-[clamp(2rem,5svh,3.5rem)] right-[var(--gutter)] z-[2] hidden text-right text-ivory lg:block">
            <span data-hero-in className="block">
              <span className="eyebrow block !text-sandstone">Project 01 — The Hearth Room</span>
              <span className="mt-2 block text-[0.72rem] tracking-[0.18em] text-sandstone/70 uppercase">Interior architecture &amp; design</span>
            </span>
          </figcaption>
        </figure>

        {/* localized contrast for type and the fixed navigation — never a flat overlay on the photography */}
        <div className="hero-vignette pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="hero-scrim-nav pointer-events-none absolute inset-x-0 top-0 z-[1] h-[30%]" aria-hidden />
        <div className="hero-scrim-top pointer-events-none absolute inset-0 z-[1] hidden md:block" aria-hidden />
        <div data-scrim-start className="hero-scrim-start pointer-events-none absolute inset-0 z-[1]" aria-hidden />
        <div className="hero-scrim-low pointer-events-none absolute inset-0 z-[1] md:hidden" aria-hidden />

        {/* opening state: the headline sits on the dark walnut paneling, clear of the furniture and the hearth */}
        <div data-start className="pointer-events-none absolute inset-0 z-[2]">
          <div className="container-x flex h-full flex-col justify-between pb-[clamp(3rem,8svh,7rem)] pt-[clamp(6rem,15svh,8rem)] text-ivory md:pb-[clamp(2.5rem,7svh,5rem)]">
            <div className="md:ml-auto md:text-right">
              <p data-hero-in className="eyebrow mb-5 !text-sandstone md:mb-6">Atelier Verre — The Art of Living</p>
              <h1 id="hero-title" className="display-xl max-w-[11ch] !text-[clamp(2.9rem,5.8vw,6.4rem)] md:ml-auto md:!text-[clamp(3.4rem,5.8vw,6.4rem)] [&_em]:!text-sandstone">
                <RevealText as="span" by="lines" waitForIntro className="block">Spaces That</RevealText>
                <RevealText as="span" by="lines" waitForIntro delay={0.15} className="block"><em>Feel Like Home.</em></RevealText>
              </h1>
            </div>
            <div>
              <p data-hero-in className="lead max-w-md text-sandstone">
                Thoughtful interiors. Timeless materials.<br className="hidden sm:block" /> Spaces shaped around the way you live.
              </p>
              <div data-hero-in className="pointer-events-auto mt-7 flex flex-wrap gap-3 md:mt-8 md:gap-4">
                <Button href="/projects">Explore Our Work</Button>
                <Button href="/contact" variant="line">Begin a Conversation</Button>
              </div>
            </div>
          </div>
        </div>

        {/* mid-journey caption */}
        <div data-mid className="pointer-events-none invisible absolute inset-0 z-[2] container-x flex flex-col justify-end pb-[clamp(4.5rem,12svh,8rem)] text-ivory md:items-end md:justify-start md:pb-0 md:pt-[15svh] md:text-right">
          <p className="eyebrow mb-4 !text-sandstone">01 — Material</p>
          <p className="display-s max-w-[15ch] md:max-w-[20ch] [&_em]:!text-sandstone">Walnut, stone and bronze, <em>held in warm light.</em></p>
        </div>

        {/* closing state — the only place the calls to action return */}
        <div data-end className="pointer-events-none invisible absolute inset-0 z-[2] container-x flex flex-col justify-end pb-[clamp(3.5rem,9svh,7rem)] text-ivory md:items-end md:justify-start md:pb-0 md:pt-[15svh] md:text-right">
          <p className="eyebrow mb-4 !text-sandstone">Atelier Verre</p>
          <p className="display-m max-w-[14ch] !text-[clamp(2rem,3.6vw,4rem)] md:max-w-[18ch] [&_em]:!text-sandstone">Every room, <em>composed with care.</em></p>
          <div className="pointer-events-auto mt-6 flex flex-wrap gap-3 md:justify-end md:gap-4">
            <Button href="/projects">Explore Our Work</Button>
            <Button href="/contact" variant="line">Begin a Conversation</Button>
          </div>
        </div>

        {/* scroll indicator + progress rail (desktop: vertical on the right edge; mobile: hairline along the bottom) */}
        <div data-hero-in className="pointer-events-none absolute bottom-[clamp(7rem,19svh,11rem)] right-[var(--gutter)] z-[2] hidden flex-col items-center gap-4 text-ivory group-data-[seq=error]/hero:hidden group-data-[seq=static]/hero:hidden md:flex" aria-hidden>
          <span data-hint className="eyebrow !text-sandstone [writing-mode:vertical-rl]">
            <span className="group-data-[seq=loading]/hero:hidden">Scroll</span>
            <span className="hidden animate-pulse group-data-[seq=loading]/hero:inline">Loading</span>
          </span>
          <span className="relative block h-24 w-px bg-ivory/25">
            <span className="absolute inset-0 origin-top bg-bronze [transform:scaleY(var(--hp))]" />
          </span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-px bg-ivory/15 group-data-[seq=error]/hero:hidden group-data-[seq=static]/hero:hidden md:hidden" aria-hidden>
          <span className="block h-full origin-left bg-bronze [transform:scaleX(var(--hp))]" />
        </div>

        <p data-seq-live role="status" aria-live="polite" className="sr-only" />
      </div>
    </section>
  );
}
