"use client";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";
import { getLenis } from "@/lib/lenis";
import { PROCESS } from "@/data/studio";
import type { SequenceStatus } from "@/lib/image-sequence";
import SectionLabel from "@/components/ui/SectionLabel";
import ProcessStage from "@/components/home/process/ProcessStage";
import { cn } from "@/lib/utils";

const N = PROCESS.length;

/** What the 3D model is actually showing during each stage (matched to the footage). */
const STAGE_NOTES = [
  "Seven platforms hover around the home — every room, terrace and garden still a question the brief will answer.",
  "The platforms break away and swing outward as first massing ideas are tried.",
  "Floors, terraces and glazed volumes slide in along the home's levels.",
  "Stone, timber fins and glass panels are brought in and held against the structure.",
  "The volumes lock together: slabs, glazing lines, stair and roof take their final position.",
  "Furniture, planting and layered lighting settle into every room.",
  "The finished home, handed over — lit, planted and styled.",
] as const;

/**
 * Pinned, scroll-scrubbed 3D stage: seven platforms converge on a central home that is progressively furnished, glazed,
 * lit and landscaped. One scrubbed timeline drives the canvas (via a progress ref — no React state per frame), the
 * brief-reference inset and the finished-home callouts; React state only changes when the stage number does.
 */
export default function DesignProcess({ index = "08" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const last = useRef(0);
  const progress = useRef(0);
  const wake = useRef<() => void>(() => {});

  const setStatus = (status: SequenceStatus) => { if (root.current) root.current.dataset.seq = status; };

  useGSAP(() => {
    registerGsap();
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.3,
          onUpdate: (s) => { progress.current = s.progress; wake.current(); setStage(Math.min(N - 1, Math.floor(s.progress * N))); },
          onRefresh: (s) => { progress.current = s.progress; wake.current(); },
        },
      });
      tl.fromTo("[data-pref]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.04 }, 0.005)
        .to("[data-pref]", { autoAlpha: 0, y: -10, duration: 0.05 }, 0.17)
        .fromTo("[data-pcall]", { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.03, stagger: 0.012, transformOrigin: "0 0" }, 0.93)
        .to({}, { duration: 0 }, 1);
    });
    // reduced motion: no canvas runs, so the status must not stay on "loading"
    mm.add("(prefers-reduced-motion: reduce)", () => { if (root.current) root.current.dataset.seq = "static"; });
    return () => mm.revert();
  }, { scope: root });

  // animate the copy on stage change
  useGSAP(() => {
    if (prefersReducedMotion() || last.current === stage) { last.current = stage; return; }
    last.current = stage;
    gsap.fromTo("[data-pcopy] > *, [data-pnote]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: "power3.out", overwrite: true });
  }, { scope: root, dependencies: [stage] });

  const jump = (i: number) => {
    const el = root.current; if (!el) return;
    const top = el.offsetTop + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / N);
    const l = getLenis();
    if (l && !prefersReducedMotion()) l.scrollTo(top, { duration: 1.6 }); else window.scrollTo({ top });
    setStage(i);
  };

  const p = PROCESS[stage];
  return (
    <section ref={root} data-seq="loading" className="group/proc surface-dark relative h-[560svh] [@media(prefers-reduced-motion:reduce)]:h-auto" aria-labelledby="proc-title">
      <div className="sticky top-0 flex h-svh flex-col justify-center py-11 sm:py-20 lg:py-24 [@media(prefers-reduced-motion:reduce)]:static [@media(prefers-reduced-motion:reduce)]:h-auto">
        <div className="container-x">
          <SectionLabel index={index} label="Design process" />
          <div className="grid items-center gap-5 sm:gap-7 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-0">
            <h2 id="proc-title" className="display-m lg:col-span-4 lg:self-end">From brief to <em>handover.</em></h2>

            <figure className="m-0 lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1">
              <ProcessStage stage={stage} stages={N} getProgress={() => progress.current} onWake={(fn) => { wake.current = fn; }} onStatus={setStatus} />
              <figcaption className="mt-3 sm:mt-4">
                <span className="mb-1.5 flex items-center justify-between sm:mb-2">
                  <span className="eyebrow !text-bronze">Stage {p.n} — what the model shows</span>
                  <span className="eyebrow hidden animate-pulse group-data-[seq=loading]/proc:inline" aria-hidden>Loading model</span>
                </span>
                <span data-pnote className="block min-h-[3.9rem] text-sm text-sandstone sm:min-h-[2.6rem]">{STAGE_NOTES[stage]}</span>
              </figcaption>
            </figure>

            <div className="lg:col-span-4 lg:self-start">
              <div data-pcopy className="min-h-[8.6rem] sm:min-h-[12rem] lg:mt-8" aria-live="polite">
                <p className="num text-4xl text-bronze sm:text-5xl">{p.n}<span className="text-xl text-taupe"> / 0{N}</span></p>
                <h3 className="display-s mt-2 sm:mt-3">{p.t}</h3>
                <p className="mt-2 max-w-md text-sandstone sm:mt-3">{p.d}</p>
                <p className="eyebrow mt-3 sm:mt-4">Deliverable — {p.out}</p>
              </div>
              <ol className="mt-5 flex flex-wrap gap-2 sm:mt-7" aria-label="Process stages">
                {PROCESS.map((x, i) => (
                  <li key={x.n}><button type="button" onClick={() => jump(i)} aria-label={`Stage ${x.n}: ${x.t}`} aria-current={i === stage ? "step" : undefined} className={cn("h-10 w-10 rounded-full border text-xs font-semibold transition-colors duration-500", i === stage ? "border-bronze bg-bronze text-warm-white" : "border-ivory/30 hover:border-bronze")}>{x.n}</button></li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
