"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";

export default function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: target, start: "top 20%", end: "bottom 80%", scrub: 0.2 } });
  });
  return <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px]"><div ref={bar} className="h-full origin-left scale-x-0 bg-bronze" /></div>;
}
