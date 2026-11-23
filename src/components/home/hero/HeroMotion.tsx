"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/animations";
import type { SequenceSet, SequenceStatus } from "@/lib/image-sequence";
import ImageSequenceCanvas from "./ImageSequenceCanvas";

const LIVE_TEXT: Record<SequenceStatus | "static", string> = {
  loading: "Loading the cinematic sequence.",
  ready: "Cinematic sequence ready. Scroll to move through the room.",
  error: "The cinematic sequence could not load. Showing a still image of the room.",
  static: "Showing a still image of the room. Motion is reduced.",
};

/**
 * Owns everything dynamic about the hero: the canvas, the scroll → frame mapping and the text choreography.
 * The semantic content (headline, copy, links) is rendered by the server component around it.
 */
export default function HeroMotion({ sets }: { sets: { lg: SequenceSet; sm: SequenceSet } }) {
  const host = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const wake = useRef<() => void>(() => {});

  const setStatus = (status: SequenceStatus | "static") => {
    const section = host.current?.closest<HTMLElement>("section");
    if (!section) return;
    section.dataset.seq = status;
    const live = section.querySelector("[data-seq-live]");
    if (live && live.textContent !== LIVE_TEXT[status]) live.textContent = LIVE_TEXT[status];
    if (status === "error") {
      // no footage to scrub: drop the long scroll runway and leave the poster with the opening copy
      ScrollTrigger.getAll().filter((t) => t.trigger === section).forEach((t) => t.kill());
      section.style.height = "100svh";
      ScrollTrigger.refresh();
    }
  };

  useGSAP(
    () => {
      registerGsap();
      const section = host.current?.closest<HTMLElement>("section");
      if (!section) return;
      if (prefersReducedMotion()) { setStatus("static"); return; }
      const q = (sel: string) => section.querySelectorAll<HTMLElement>(sel);

      // entrance: supporting content rises in once the preloader releases the page (the h1 reveals itself via RevealText)
      gsap.set(q("[data-hero-in]"), { autoAlpha: 0 });
      const intro = gsap.timeline({ paused: true, delay: 0.3 });
      intro.to(q("[data-hero-in]"), { autoAlpha: 1, y: 0, startAt: { y: 24 }, duration: 1.1, stagger: 0.13 });
      const play = () => intro.play();
      if (window.__avReady) play(); else document.addEventListener("av:ready", play, { once: true });

      // one scrubbed timeline of length 1 == hero scroll progress: it drives the text states and the progress rail
      const sync = (self: { progress: number }) => { progress.current = self.progress; wake.current(); };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.3, onUpdate: sync, onRefresh: sync },
      });
      tl.to(section, { "--hp": 1, duration: 1 }, 0)
        .to(q("[data-hint]"), { autoAlpha: 0, duration: 0.04 }, 0.02)
        .to(q("[data-start]"), { autoAlpha: 0, y: -48, duration: 0.15 }, 0.05)
        .to(q("[data-scrim-start]"), { autoAlpha: 0, duration: 0.18 }, 0.04)
        .fromTo(q("[data-mid]"), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.09 }, 0.32)
        .to(q("[data-mid]"), { autoAlpha: 0, y: -28, duration: 0.09 }, 0.58)
        .fromTo(q("[data-end]"), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.84);

      return () => document.removeEventListener("av:ready", play);
    },
    { scope: host },
  );

  return (
    <div ref={host} className="absolute inset-0">
      <ImageSequenceCanvas sets={sets} getProgress={() => progress.current} onWake={(fn) => { wake.current = fn; }} onStatus={(s) => setStatus(s)} />
    </div>
  );
}
