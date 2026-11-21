"use client";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";
import { getLenis } from "@/lib/lenis";
import { PROCESS } from "@/data/studio";
import SectionLabel from "@/components/ui/SectionLabel";
import { cn } from "@/lib/utils";

const N = PROCESS.length;

/** Architectural drawing that builds itself as you scroll: GSAP DrawSVG on a pinned, scrubbed timeline. Lightweight — no WebGL. */
function Blueprint() {
  const st = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, vectorEffect: "non-scaling-stroke" as const };
  const br = { ...st, stroke: "#A88C67" };
  return (
    <svg viewBox="0 0 800 520" className="h-full w-full" role="img" aria-label="Architectural plan drawn in seven stages">
      <g className="s1"><rect x="50" y="30" width="700" height="460" {...st} strokeDasharray="6 6" /><path d="M50 30h26M50 30v26M750 30h-26M750 30v26M50 490h26M50 490v-26M750 490h-26M750 490v-26" {...br} strokeWidth={2.4} /></g>
      <g className="s2"><path d="M100 80h600v360H100z" {...st} opacity={0.5} /><path d="M100 80l600 360M700 80L100 440" {...st} opacity={0.18} /></g>
      <g className="s3"><path d="M100 80h600v360H100z" {...st} strokeWidth={4} /><path d="M440 80v200M100 280h340M440 280h260" {...st} strokeWidth={3} /><path d="M440 180a40 40 0 0 1 40 -40M180 280a50 50 0 0 0 50 50" {...st} opacity={0.6} /><path d="M560 440v-70h140" {...st} strokeWidth={3} /></g>
      <g className="s4"><path d="M110 90h320v180H110z" {...br} opacity={0.9} /><path d="M120 110h300M120 130h300M120 150h300M120 170h300M120 190h300M120 210h300M120 230h300M120 250h300" {...br} strokeWidth={0.8} opacity={0.5} /><path d="M450 90h240v180H450z" {...br} strokeDasharray="3 5" /></g>
      <g className="s5"><path d="M110 90h200v26H110z" {...st} /><path d="M118 90v26M130 90v26M142 90v26M154 90v26M166 90v26M178 90v26M190 90v26M202 90v26M214 90v26M226 90v26M238 90v26M250 90v26M262 90v26M274 90v26M286 90v26M298 90v26" {...st} strokeWidth={0.8} opacity={0.6} /><path d="M660 90h30v100h-30z" {...st} /></g>
      <g className="s6"><path d="M200 230a90 90 0 0 1 180 0" {...st} strokeWidth={3} /><path d="M215 230a75 75 0 0 1 150 0" {...st} /><circle cx="290" cy="196" r="34" {...br} strokeWidth={2} /><rect x="170" y="160" width="36" height="36" rx="8" {...st} /><rect x="374" y="160" width="36" height="36" rx="8" {...st} /><rect x="500" y="110" width="150" height="130" {...st} /><rect x="480" y="320" width="90" height="90" rx="45" {...st} /><rect x="150" y="320" width="160" height="90" rx="6" {...st} /></g>
      <g className="s7"><path d="M100 60v-14M700 60v-14M100 53h600M100 460v14M700 460v14M100 467h600" {...br} /><path d="M72 80h-14M72 440h-14M65 80v360" {...br} /><circle cx="560" cy="330" r="8" {...br} /><path d="M552 330h16M560 322v16" {...br} /><circle cx="250" cy="330" r="8" {...br} /><path d="M242 330h16M250 322v16" {...br} /></g>
    </svg>
  );
}

export default function DesignProcess({ index = "08" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const last = useRef(0);
  useGSAP(() => {
    registerGsap();
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6, onUpdate: (s) => setStage(Math.min(N - 1, Math.floor(s.progress * N))) },
      });
      for (let i = 1; i <= N; i++) {
        tl.from(`.s${i} > *`, { drawSVG: "0%", opacity: 0, duration: 0.9, stagger: 0.08 }, i - 1);
      }
      tl.to({}, { duration: 0.001 }, N);
    });
    return () => mm.revert();
  }, { scope: root });
  // animate the copy on stage change
  useGSAP(() => {
    if (prefersReducedMotion() || last.current === stage) { last.current = stage; return; }
    last.current = stage;
    gsap.fromTo("[data-pcopy] > *", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: "power3.out", overwrite: true });
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
    <section ref={root} className="surface-dark relative h-[560svh] [@media(prefers-reduced-motion:reduce)]:h-auto" aria-labelledby="proc-title">
      <div className="sticky top-0 flex h-svh flex-col justify-center py-24 [@media(prefers-reduced-motion:reduce)]:static [@media(prefers-reduced-motion:reduce)]:h-auto">
        <div className="container-x">
          <SectionLabel index={index} label="Design process" />
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-x-16">
            <div className="lg:col-span-5">
              <h2 id="proc-title" className="display-m">From brief to <em>handover.</em></h2>
              <div data-pcopy className="mt-8 min-h-[12.5rem]" aria-live="polite">
                <p className="num text-5xl text-bronze">{p.n}<span className="text-xl text-taupe"> / 0{N}</span></p>
                <h3 className="display-s mt-3">{p.t}</h3>
                <p className="mt-3 max-w-md text-sandstone">{p.d}</p>
                <p className="eyebrow mt-4">Deliverable — {p.out}</p>
              </div>
              <ol className="mt-8 flex flex-wrap gap-2" aria-label="Process stages">
                {PROCESS.map((x, i) => (
                  <li key={x.n}><button type="button" onClick={() => jump(i)} aria-label={`Stage ${x.n}: ${x.t}`} aria-current={i === stage ? "step" : undefined} className={cn("h-10 w-10 rounded-full border text-xs font-semibold transition-colors duration-500", i === stage ? "border-bronze bg-bronze text-warm-white" : "border-ivory/30 hover:border-bronze")}>{x.n}</button></li>
                ))}
              </ol>
            </div>
            <div className="lg:col-span-7"><div className="aspect-[800/520] w-full border border-ivory/15 bg-charcoal/40 p-4 text-ivory"><Blueprint /></div></div>
          </div>
        </div>
      </div>
    </section>
  );
}
