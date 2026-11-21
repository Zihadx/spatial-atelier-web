"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** Infinite ticker that speeds up and reverses with scroll velocity (GSAP, transform-only). */
export default function Marquee({ items, className, speed = 60 }: { items: string[]; className?: string; speed?: number }) {
  const track = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    registerGsap();
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const half = el.scrollWidth / 2;
    const loop = gsap.to(el, { x: -half, duration: half / speed, ease: "none", repeat: -1 });
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
        gsap.to(loop, { timeScale: v === 0 ? 1 : v, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.2, overwrite: "auto" });
      },
    });
    return () => st.kill();
  });
  const row = [...items, ...items];
  return (
    <div className={cn("overflow-hidden whitespace-nowrap", className)} aria-hidden>
      <div ref={track} className="flex w-max will-change-transform">
        {row.concat(row).map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="display-m px-8">{t}</span>
            <span className="h-2 w-2 rotate-45 bg-bronze" />
          </span>
        ))}
      </div>
    </div>
  );
}
