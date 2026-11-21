"use client";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { gsap, isCoarsePointer, prefersReducedMotion, registerGsap } from "@/lib/animations";

/** Subtle custom cursor. Elements with data-cursor="Label" expand it and show the label. Disabled on touch / reduced motion. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  useGSAP(() => {
    registerGsap();
    const el = dot.current;
    if (!el || isCoarsePointer() || prefersReducedMotion()) return;
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0 });
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    const move = (e: PointerEvent) => { gsap.to(el, { opacity: 1, duration: 0.3, overwrite: "auto" }); x(e.clientX); y(e.clientY); };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      if (t?.dataset.cursor) { setLabel(t.dataset.cursor); gsap.to(el, { width: 92, height: 92, duration: 0.5, ease: "power3.out" }); }
      else { setLabel(""); gsap.to(el, { width: 12, height: 12, duration: 0.5, ease: "power3.out" }); }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerover", over); };
  });
  return (
    <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] flex h-3 w-3 items-center justify-center rounded-full bg-bronze/90 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-warm-white mix-blend-normal [@media(pointer:coarse)]:hidden">
      {label}
    </div>
  );
}
