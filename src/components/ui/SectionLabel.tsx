"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** Section index + animated rule: gives every section the same entrance and a clear place in the sequence. */
export default function SectionLabel({ index, label, className }: { index: string; label: string; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion() || !root.current) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 90%", once: true } });
    tl.from("[data-rule]", { scaleX: 0, transformOrigin: "left center", duration: 1.2, ease: "expo.out" })
      .from("[data-lbl]", { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.08 }, 0.1);
  }, { scope: root });
  return (
    <div ref={root} className={cn("mb-8 flex items-center gap-5", className)}>
      <span className="mask"><span data-lbl className="num block text-sm">{index}</span></span>
      <span data-rule className="h-px w-14 bg-current opacity-40" />
      <span className="mask"><span data-lbl className="eyebrow block">{label}</span></span>
    </div>
  );
}
