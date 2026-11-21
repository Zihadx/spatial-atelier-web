"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";

export default function CountUp({ to, pad = 2 }: { to: number; pad?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    registerGsap();
    const el = ref.current; if (!el) return;
    const fmt = (n: number) => String(Math.round(n)).padStart(pad, "0");
    if (prefersReducedMotion()) { el.textContent = fmt(to); return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: "power2.out", onUpdate: () => { el.textContent = fmt(o.v); }, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  }, { scope: ref });
  return <span ref={ref}>{String(to).padStart(pad, "0")}</span>;
}
