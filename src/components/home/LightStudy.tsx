"use client";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";
import SectionLabel from "@/components/ui/SectionLabel";
import Reveal from "@/components/ui/Reveal";
import RevealText from "@/components/ui/RevealText";

const NOTES: [string, string][] = [
  ["Colour temperature", "Cool daylight settles into amber as the sun drops and lamps take over."],
  ["Shadow and depth", "Fluted stone and the curved sofa read very differently in raking light."],
  ["Material response", "Boucle, travertine and bronze each hold the light in their own way."],
];

/** Same room, same camera, two hours of the day. A GSAP-driven reveal you can also drag, or operate with the keyboard (native range input). */
export default function LightStudy({ index = "05" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const [v, setV] = useState(50);
  const set = (n: number) => {
    if (top.current) top.current.style.clipPath = `inset(0 ${100 - n}% 0 0)`;
    if (handle.current) handle.current.style.left = `${n}%`;
    if (range.current) range.current.value = String(Math.round(n));
  };
  useGSAP(() => {
    registerGsap();
    set(50);
    if (prefersReducedMotion()) return;
    const o = { v: 50 };
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 55%", once: true }, defaults: { ease: "power2.inOut" } })
      .to(o, { v: 14, duration: 1.4, onUpdate: () => set(o.v) })
      .to(o, { v: 86, duration: 2, onUpdate: () => set(o.v) })
      .to(o, { v: 50, duration: 1.2, onUpdate: () => set(o.v) });
  }, { scope: root });
  return (
    <section ref={root} className="surface-sand" aria-labelledby="light-title">
      <div className="container-x section">
        <SectionLabel index={index} label="Light study" />
        <div className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
          <RevealText as="h2" className="display-l lg:col-span-7"><span id="light-title">One room, <em>two hours.</em></span></RevealText>
          <Reveal className="lg:col-span-5"><p className="lead">Drag across the room. Light is the first material we design with: the same walls and furniture become a different space between noon and dusk.</p></Reveal>
        </div>
        <Reveal>
          <div className="relative aspect-[16/9] max-h-[78svh] w-full select-none overflow-hidden bg-espresso" data-cursor="Drag">
            <Image src="/images/hero/living-room.jpg" alt="Living room in daylight" fill sizes="(min-width: 1024px) 90vw, 100vw" className="object-cover" />
            <div ref={top} className="absolute inset-0 will-change-[clip-path]"><Image src="/images/hero/living-room-dusk.jpg" alt="The same living room at dusk" fill sizes="(min-width: 1024px) 90vw, 100vw" className="object-cover" /></div>
            <div ref={handle} aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-ivory"><span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ivory bg-charcoal/50 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-ivory backdrop-blur">Drag</span></div>
            <span className="pointer-events-none absolute left-4 top-4 bg-charcoal/70 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-ivory">Dusk</span>
            <span className="pointer-events-none absolute right-4 top-4 bg-ivory/90 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-espresso">Daylight</span>
            <input ref={range} type="range" min={0} max={100} defaultValue={50} aria-label="Compare the room at dusk (left) and in daylight (right)" onChange={(e) => { const n = Number(e.target.value); set(n); setV(n); }} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
          </div>
        </Reveal>
        <p className="sr-only" role="status">{v < 50 ? "More dusk" : v > 50 ? "More daylight" : "Even split"}</p>
        <Reveal stagger={0.1} className="mt-10 grid gap-8 md:grid-cols-3">
          {NOTES.map(([t, d]) => <div key={t} className="border-t border-espresso/25 pt-5"><h3 className="display-s">{t}</h3><p className="mt-2 text-sm text-espresso/75">{d}</p></div>)}
        </Reveal>
      </div>
    </section>
  );
}
