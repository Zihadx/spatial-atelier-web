"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ImageSequenceCanvas from "@/components/home/hero/ImageSequenceCanvas";
import manifest from "@/data/process-sequence.json";
import { frameUrl, progressToFrame, type SequenceSet, type SequenceStatus } from "@/lib/image-sequence";
import { cn } from "@/lib/utils";

const pick = (s: SequenceSet): SequenceSet => ({ count: s.count, width: s.width, height: s.height, pad: s.pad, dir: s.dir, curve: s.curve });
export const PROCESS_SETS = { lg: pick(manifest.sets.lg as SequenceSet), sm: pick(manifest.sets.sm as SequenceSet) };

/** Which source frame best represents the middle of each stage (used for the reduced-motion stills). */
export const stageFrame = (stage: number, stages: number) => Math.round(progressToFrame(PROCESS_SETS.lg, (stage + 0.5) / stages));

/** Finished-home callouts, positioned in the footage's own coordinates (fractions of the 16:9 frame at the final pose). */
const CALLOUTS = [
  { label: "Floor-to-ceiling glazing", x: 0.5, y: 0.37, side: "up" },
  { label: "Planting", x: 0.19, y: 0.41, side: "left" },
  { label: "Stone cladding", x: 0.38, y: 0.47, side: "up" },
  { label: "Layered lighting", x: 0.58, y: 0.6, side: "up" },
  { label: "Timber fins", x: 0.77, y: 0.64, side: "right" },
  { label: "Stone terrace & water", x: 0.52, y: 0.81, side: "down" },
] as const;

const SIDE = {
  up: { line: "bottom-0 left-0 h-9 w-px", label: "bottom-10 left-0 -translate-x-1/2" },
  down: { line: "top-0 left-0 h-9 w-px", label: "top-10 left-0 -translate-x-1/2" },
  left: { line: "right-0 top-0 h-px w-10", label: "right-12 top-0 -translate-y-1/2" },
  right: { line: "left-0 top-0 h-px w-10", label: "left-12 top-0 -translate-y-1/2" },
} as const;

const ALT =
  "A luxury two-storey home shown as an exploded 3D model: seven floating platforms of rooms, terraces and planting that converge onto a central home, which ends fully glazed, furnished, lit and landscaped.";

const REF = { src: "/images/architecture/spatial.jpg", alt: "Reference image: a warmly lit, material-rich living room from the studio's portfolio" };

interface Props {
  stage: number;
  stages: number;
  getProgress: () => number;
  onWake: (wake: () => void) => void;
  onStatus: (status: SequenceStatus) => void;
}

/**
 * The 3D stage of the Design Process. A scroll-scrubbed canvas plays the supplied render of the home assembling from
 * seven platforms; it only starts loading when the section is about to be reached and releases its frames when it
 * is far away. With reduced motion the canvas never starts and each stage shows a still instead.
 */
export default function ProcessStage({ stage, stages, getProgress, onWake, onStatus }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setArmed(e.isIntersecting), { rootMargin: "200% 0px 200% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} data-pstage className="relative aspect-[4/3] w-full overflow-hidden border border-ivory/15 bg-[#E9DCCB] sm:aspect-[16/9]">
      {/* poster: first frame — paints before the canvas and stays as the fallback */}
      {/* served as-is (already an optimised WebP): same URL the canvas fetches first, so it is downloaded once and never waits on the image optimizer */}
      <Image src={frameUrl(PROCESS_SETS.lg, 0)} alt={ALT} fill unoptimized loading={armed ? "eager" : "lazy"} sizes="(min-width: 1024px) 62vw, 100vw" className="object-cover" />

      {/* reduced motion: one still per stage instead of a scrubbed canvas */}
      <div className="absolute inset-0 hidden [@media(prefers-reduced-motion:reduce)]:block">
        {Array.from({ length: stages }, (_, i) => (
          <Image
            key={i}
            src={frameUrl(PROCESS_SETS.lg, stageFrame(i, stages))}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 62vw, 100vw"
            className={cn("object-cover transition-opacity duration-700", i === stage ? "opacity-100" : "opacity-0")}
            aria-hidden
          />
        ))}
      </div>

      <div className="absolute inset-0 [@media(prefers-reduced-motion:reduce)]:hidden">
        {armed && <ImageSequenceCanvas sets={PROCESS_SETS} getProgress={getProgress} onWake={onWake} onStatus={(s) => onStatus(s)} pan={() => ({ from: 0.5, to: 0.5 })} focalY={0.5} />}
      </div>

      {/* stage 01 only: the brief's reference material, as the client would bring it */}
      <figure data-pref className="pointer-events-none absolute bottom-[4%] right-[3%] z-[2] hidden w-[17%] sm:block [@media(prefers-reduced-motion:reduce)]:hidden" aria-hidden>
        <span className="relative block aspect-[4/3] overflow-hidden border border-espresso/20 bg-sandstone shadow-[0_10px_30px_-12px_rgba(36,36,33,0.5)]">
          <Image src={REF.src} alt="" fill sizes="12vw" className="object-cover" />
        </span>
        <figcaption className="mt-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-espresso/70">Brief reference</figcaption>
      </figure>

      {/* the finished home, annotated (desktop/tablet: positions are exact only at the footage's own 16:9 framing) */}
      <ul className="pointer-events-none absolute inset-0 z-[2] hidden sm:block [@media(prefers-reduced-motion:reduce)]:hidden" aria-label="Details of the finished home">
        {CALLOUTS.map((c) => (
          <li key={c.label} data-pcall className="absolute" style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }}>
            <span aria-hidden className="absolute block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bronze ring-4 ring-bronze/30" />
            <span aria-hidden className={cn("absolute block bg-espresso/55", SIDE[c.side].line)} />
            <span className={cn("absolute whitespace-nowrap bg-ivory/90 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-espresso", SIDE[c.side].label)}>{c.label}</span>
          </li>
        ))}
      </ul>

      {/* corner brackets: carried over from the original blueprint panel */}
      {["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "left-3 bottom-3 border-b border-l", "right-3 bottom-3 border-b border-r"].map((c) => (
        <span key={c} aria-hidden className={cn("pointer-events-none absolute z-[3] block h-5 w-5 border-bronze/80", c)} />
      ))}
    </div>
  );
}
