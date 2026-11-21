"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

let registered = false;

/** Register GSAP plugins exactly once (client only). */
export function registerGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin);
  gsap.defaults({ ease: "power3.out", duration: 1.1 });
  registered = true;
  return gsap;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCoarsePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

/** Shared mutable scroll progress for 3D scenes (read inside useFrame, never triggers React renders). */
export const sceneProgress = {
  hero: { current: 0 },
};

export { gsap, ScrollTrigger, SplitText, Flip, DrawSVGPlugin };
