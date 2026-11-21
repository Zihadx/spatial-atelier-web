"use client";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, registerGsap, sceneProgress, ScrollTrigger } from "@/lib/animations";
import { HeroCanvas } from "@/components/three/scenes";
import Button from "@/components/ui/Button";
import RevealText from "@/components/ui/RevealText";

/** The single signature 3D moment. A priority poster paints first; the live scene mounts when the browser is idle (and not on Save-Data). */
export default function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData || prefersReducedMotion()) return;
    const go = () => setLive(true);
    if ("requestIdleCallback" in window) { const id = window.requestIdleCallback(go, { timeout: 2500 }); return () => window.cancelIdleCallback(id); }
    const t = setTimeout(go, 1500);
    return () => clearTimeout(t);
  }, []);

  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion()) { sceneProgress.hero.current = 0.3; return; }
    ScrollTrigger.create({ trigger: root.current, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => { sceneProgress.hero.current = s.progress; } });
    gsap.to(copy.current, { opacity: 0, y: -70, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "24% top", scrub: true } });
    gsap.to("[data-poster]", { scale: 1.12, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true } });
    const intro = gsap.timeline({ paused: true, delay: 0.4 });
    gsap.set("[data-hero-in]", { autoAlpha: 0 });
    intro.to("[data-hero-in]", { autoAlpha: 1, y: 0, startAt: { y: 24 }, duration: 1.1, stagger: 0.13, ease: "power3.out" });
    const play = () => intro.play();
    if (window.__avReady) play(); else document.addEventListener("av:ready", play, { once: true });
    return () => document.removeEventListener("av:ready", play);
  }, { scope: root });

  return (
    <section ref={root} className="relative h-[250svh] bg-espresso [@media(prefers-reduced-motion:reduce)]:h-svh" aria-label="Introduction">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div data-poster className="absolute inset-0 will-change-transform"><Image src="/images/hero/living-room.jpg" alt="" fill priority sizes="100vw" className="object-cover" aria-hidden /></div>
        {live && <div className="absolute inset-0"><HeroCanvas progress={sceneProgress.hero} /></div>}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/25 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" aria-hidden />
        <div ref={copy} className="container-x absolute inset-0 flex flex-col justify-end pb-[clamp(4rem,9vh,7rem)] text-ivory">
          <p data-hero-in className="eyebrow mb-6 !text-sandstone">Atelier Verre — The Living Space</p>
          <h1 className="display-xl max-w-[11ch] !text-[clamp(3rem,6.2vw,7rem)]" aria-label="Spaces that feel like home.">
            <RevealText as="span" by="lines" waitForIntro className="block">Spaces That</RevealText>
            <RevealText as="span" by="lines" waitForIntro delay={0.15} className="block"><em>Feel Like Home.</em></RevealText>
          </h1>
          <p data-hero-in className="lead mt-7 max-w-md text-sandstone">Thoughtful interiors. Timeless materials. Spaces shaped around the way you live.</p>
          <div data-hero-in className="pointer-events-auto mt-9 flex flex-wrap gap-4">
            <Button href="/projects">Explore Our Work</Button>
            <Button href="/contact" variant="line">Begin a Conversation</Button>
          </div>
        </div>
        <div data-hero-in className="absolute bottom-8 right-[var(--gutter)] hidden flex-col items-center gap-4 text-ivory md:flex" aria-hidden>
          <span className="eyebrow !text-sandstone [writing-mode:vertical-rl]">Scroll to enter</span>
          <span className="scroll-line" />
        </div>
      </div>
    </section>
  );
}
