"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Photo from "@/components/ui/Photo";
import RevealText from "@/components/ui/RevealText";
import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import { PHOTO } from "@/data/photos";
import { VALUES } from "@/data/studio";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";

/** Full-bleed photograph with scrubbed parallax and a slow zoom; copy sits in a fixed two-column grid. No invented credentials. */
export default function StudioStory({ index = "09" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    gsap.fromTo("[data-bg]", { yPercent: -10, scale: 1.15 }, { yPercent: 10, scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
  }, { scope: root });
  return (
    <section ref={root} className="surface-ink relative isolate overflow-hidden" aria-labelledby="story-title">
      <div data-bg className="absolute inset-[-8%] -z-20 will-change-transform"><Photo photo={PHOTO.story} sizes="100vw" /></div>
      <div className="absolute inset-0 -z-10 bg-charcoal/70" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal via-transparent to-charcoal" aria-hidden />
      <div className="container-x section">
        <SectionLabel index={index} label="Studio story" />
        <RevealText as="h2" className="display-l max-w-[16ch]"><span id="story-title">We design the way <em>light moves</em> through a home.</span></RevealText>
        <div className="mt-16 grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5"><p className="lead">Atelier Verre is a concept studio built around one idea: a luxury interior should feel calm before it feels impressive. We start with architecture — walls, openings, proportion — and let furniture and finish follow.</p></Reveal>
          <Reveal className="md:col-span-6 md:col-start-7" stagger={0.1}>
            {VALUES.map((v) => (
              <div key={v.t} className="grid grid-cols-[1fr_1fr] items-baseline gap-6 border-t border-ivory/20 py-5"><h3 className="display-s">{v.t}</h3><p className="text-sm text-sandstone">{v.d}</p></div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
