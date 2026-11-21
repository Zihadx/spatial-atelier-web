"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap, SplitText } from "@/lib/animations";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "div" | "span";

interface Props {
  children: React.ReactNode;
  as?: Tag;
  className?: string;
  by?: "lines" | "words";
  delay?: number;
  /** animate on scroll into view (default) or immediately on mount */
  onScroll?: boolean;
  /** wait for the preloader to finish before animating (hero) */
  waitForIntro?: boolean;
}

/** Masked line/word reveal built on GSAP SplitText. Falls back to plain visible text when motion is reduced. */
export default function RevealText({ children, as: Tag = "div", className, by = "lines", delay = 0, onScroll = true, waitForIntro = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      registerGsap();
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) { gsap.set(el, { opacity: 1 }); return; }
      let started = !waitForIntro || (window as unknown as { __avReady?: boolean }).__avReady === true;
      let tween: gsap.core.Animation | undefined;
      const split = SplitText.create(el, {
        type: by,
        mask: by,
        autoSplit: true,
        aria: "auto",
        onSplit(self) {
          gsap.set(el, { opacity: 1 });
          const targets = by === "words" ? self.words : self.lines;
          tween = gsap.from(targets, {
            yPercent: 115,
            duration: 1.3,
            ease: "expo.out",
            stagger: by === "words" ? 0.045 : 0.1,
            delay,
            paused: !started,
            scrollTrigger: onScroll && !waitForIntro ? { trigger: el, start: "top 88%", once: true } : undefined,
          });
          return tween;
        },
      });
      const go = () => { started = true; tween?.play(); };
      if (!started) document.addEventListener("av:ready", go, { once: true });
      return () => { document.removeEventListener("av:ready", go); split.revert(); };
    },
    { scope: ref },
  );
  const T = Tag as React.ElementType;
  return <T ref={ref} data-split className={className}>{children}</T>;
}
