"use client";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/animations";
import { setLenis } from "@/lib/lenis";

/** Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger stays perfectly in sync (one animation clock). */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); setLenis(null); };
  }, []);

  useEffect(() => {
    // new route: reset scroll and recalculate triggers once the page has mounted
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => { cancelAnimationFrame(id); clearTimeout(t); };
  }, [pathname]);

  return null;
}
