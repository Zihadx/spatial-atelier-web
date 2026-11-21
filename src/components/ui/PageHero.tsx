"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import type { Photo as PhotoData } from "@/data/photos";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";
import Photo from "./Photo";
import Reveal from "./Reveal";
import RevealText from "./RevealText";

interface Props {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  photo: PhotoData;
  children?: React.ReactNode;
}

/** Photography-led page hero: image drifts and scales as you leave it; copy sits on a fixed baseline grid. */
export default function PageHero({ eyebrow, title, lead, photo, children }: Props) {
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion() || !root.current || !img.current) return;
    gsap.fromTo(img.current, { scale: 1.18 }, { scale: 1, duration: 2.2, ease: "expo.out" });
    gsap.to(img.current, { yPercent: 14, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
  }, { scope: root });
  return (
    <section ref={root} className="surface-ink relative isolate flex min-h-[78svh] items-end overflow-hidden">
      <div ref={img} className="absolute inset-0 -z-20 will-change-transform"><Photo photo={photo} priority sizes="100vw" /></div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/25" aria-hidden />
      <div className="container-x pb-[clamp(3rem,7vw,6rem)] pt-40">
        <Reveal y={14}><p className="eyebrow mb-6 !text-sandstone">{eyebrow}</p></Reveal>
        <RevealText as="h1" className="display-xl max-w-[12ch]">{title}</RevealText>
        {lead && <Reveal y={20} delay={0.2}><p className="lead mt-7 text-sandstone">{lead}</p></Reveal>}
        {children && <Reveal y={20} delay={0.3} className="mt-9">{children}</Reveal>}
      </div>
    </section>
  );
}
