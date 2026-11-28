"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import ImageReveal from "@/components/ui/ImageReveal";
import SectionLabel from "@/components/ui/SectionLabel";
import { PHOTO } from "@/data/photos";
import type { PhilosophyItem } from "@/content";
import { gsap, prefersReducedMotion, registerGsap, SplitText } from "@/lib/animations";

const STATEMENT = "A home should be quiet before it is impressive: designed from light and proportion, finished in materials that age with grace, and arranged so every object has an obvious place.";

/** Scroll-scrubbed reading line (words light up as you read), then six principles in a strict two-column grid beside a sticky photograph. */
export default function DesignPhilosophy({ index = "07", items: PHILOSOPHY }: { index?: string; items: PhilosophyItem[] }) {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    const split = SplitText.create("[data-statement]", { type: "words", aria: "none" });
    // colour sweep between two AA-contrast values (muted → espresso) instead of fading to 16% opacity, which fails WCAG contrast
    gsap.fromTo(split.words, { color: "#5A554D" }, { color: "#332B24", stagger: 0.08, ease: "none", scrollTrigger: { trigger: "[data-statement]", start: "top 78%", end: "bottom 48%", scrub: true } });
    gsap.from("[data-pr]", { y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: "[data-grid]", start: "top 78%", once: true } });
    gsap.utils.toArray<HTMLElement>("[data-line]").forEach((l) => gsap.from(l, { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: l, start: "top 90%", once: true } }));
    return () => split.revert();
  }, { scope: root });
  return (
    <section ref={root} className="surface-sand" aria-labelledby="phil-title">
      <div className="container-x section">
        <SectionLabel index={index} label="Design philosophy" />
        <h2 id="phil-title" className="sr-only">Design philosophy</h2>
        <p data-statement className="display-m max-w-[30ch] lg:max-w-[34ch]">{STATEMENT}</p>
        <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-x-14">
          <div className="lg:col-span-4"><div className="lg:sticky lg:top-28"><ImageReveal photo={PHOTO.philosophy} frame="portrait" sizes="(min-width: 1024px) 30vw, 100vw" caption="Reference photography" /></div></div>
          <ol data-grid className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
            {PHILOSOPHY.map((p) => (
              <li key={p.n} data-pr className="py-8">
                <span data-line className="mb-6 block h-px bg-espresso/25" />
                <span className="num text-4xl text-bronze">{p.n}</span>
                <h3 className="display-s mt-3">{p.t}</h3>
                <p className="mt-3 text-sm text-espresso/75">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
