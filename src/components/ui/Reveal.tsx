"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  y?: number;
  x?: number;
  delay?: number;
  /** animate direct children one after another */
  stagger?: number;
  as?: React.ElementType;
}

/** Scroll-triggered fade/translate reveal with consistent easing. */
export default function Reveal({ children, className, y = 40, x = 0, delay = 0, stagger, as: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) { gsap.set(el, { opacity: 1 }); return; }
      const targets = stagger ? Array.from(el.children) : el;
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(targets, { autoAlpha: 0, y, x }, {
        autoAlpha: 1, y: 0, x: 0, duration: 1.2, delay, ease: "power3.out", stagger: stagger ?? 0,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    },
    { scope: ref },
  );
  const T = Tag as React.ElementType;
  return <T ref={ref} data-reveal className={cn(className)}>{children}</T>;
}
