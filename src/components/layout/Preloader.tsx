"use client";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";

declare global { interface Window { __avReady?: boolean } }

/** GSAP brand intro: letter-by-letter wordmark, a counting rule, then a curtain lift that releases the hero typography. Short on repeat visits. */
export default function Preloader({ brand }: { brand: { name: string; wordmark: { lead: string } } }) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  useGSAP(() => {
    registerGsap();
    const done = () => { window.__avReady = true; document.dispatchEvent(new Event("av:ready")); setGone(true); };
    const seen = sessionStorage.getItem("av-intro");
    sessionStorage.setItem("av-intro", "1");
    if (prefersReducedMotion() || seen) {
      gsap.to(root.current, { autoAlpha: 0, duration: 0.3, onComplete: done });
      return;
    }
    const n = { v: 0 };
    const tl = gsap.timeline({ onComplete: done });
    tl.from("[data-pl]", { yPercent: 110, duration: 1, ease: "expo.out", stagger: 0.04 })
      .to(n, { v: 100, duration: 1.7, ease: "power2.inOut", onUpdate: () => { const c = root.current?.querySelector("[data-count]"); if (c) c.textContent = String(Math.round(n.v)).padStart(3, "0"); } }, 0.2)
      .to("[data-bar]", { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, 0.2)
      .to("[data-pl]", { yPercent: -110, duration: 0.7, ease: "expo.in", stagger: 0.02 }, 2.1)
      .to(root.current, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, 2.45);
  }, { scope: root });
  if (gone) return null;
  const word = brand.name.split("");
  return (
    <div ref={root} data-preloader aria-hidden className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-espresso text-ivory">
      <p className="font-display text-5xl md:text-8xl" style={{ display: "flex" }}>
        {word.map((c, i) => <span key={i} className="mask inline-block"><span data-pl className={`inline-block ${i > brand.wordmark.lead.length ? "italic text-bronze" : ""}`}>{c === " " ? "\u00A0" : c}</span></span>)}
      </p>
      <div className="mt-10 flex w-64 items-center gap-4"><span className="relative block h-px flex-1 bg-ivory/20"><span data-bar className="absolute inset-0 origin-left scale-x-0 bg-bronze" /></span><span data-count className="num w-10 text-sm text-taupe">000</span></div>
    </div>
  );
}
