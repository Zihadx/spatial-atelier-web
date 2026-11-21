"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import Photo from "@/components/ui/Photo";
import RevealText from "@/components/ui/RevealText";
import SectionLabel from "@/components/ui/SectionLabel";
import { PHOTO } from "@/data/photos";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";

/** Photographic invitation: the image wipes open (clip-path) then drifts; one clear action. */
export default function ConsultationCTA({ index = "13" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    gsap.fromTo("[data-cta-img]", { clipPath: "inset(12% 6% 12% 6%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 15%", scrub: true } });
    gsap.fromTo("[data-cta-in]", { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
  }, { scope: root });
  return (
    <section ref={root} className="surface-dark relative isolate overflow-hidden" aria-labelledby="cta-title">
      <div data-cta-img className="absolute inset-0 -z-10"><div data-cta-in className="absolute inset-[-6%]"><Photo photo={PHOTO.cta} sizes="100vw" /></div></div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal/90 via-charcoal/55 to-charcoal/20" aria-hidden />
      <div className="container-x flex min-h-[78svh] flex-col justify-center py-24">
        <SectionLabel index={index} label="Project consultation" />
        <RevealText as="h2" className="display-l max-w-[12ch]"><span id="cta-title">Start with a <em>conversation.</em></span></RevealText>
        <p className="lead mt-6 text-sandstone">Tell us about the space, the household and the way you want it to feel. We will respond with a clear first step.</p>
        <div className="mt-9"><Button href="/contact">Start your project</Button></div>
      </div>
    </section>
  );
}
