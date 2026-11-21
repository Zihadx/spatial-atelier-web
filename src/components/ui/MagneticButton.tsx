"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, isCoarsePointer, prefersReducedMotion, registerGsap } from "@/lib/animations";

/** Wraps a button/link so it gently follows the pointer (fine pointers only). */
export default function MagneticButton({ children, strength = 0.28, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el || isCoarsePointer() || prefersReducedMotion()) return;
      const x = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * strength);
        y((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => { x(0); y(0); };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
    },
    { scope: ref },
  );
  return <span ref={ref} className={className} style={{ display: "inline-block" }}>{children}</span>;
}
