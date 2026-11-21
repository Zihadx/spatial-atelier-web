"use client";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import type { Photo as PhotoData } from "@/data/photos";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";
import { cn } from "@/lib/utils";
import Photo from "./Photo";

interface Props {
  photo: PhotoData;
  frame?: "portrait" | "landscape" | "wide" | "square";
  sizes?: string;
  className?: string;
  priority?: boolean;
  parallax?: number;
  zoom?: boolean;
  cursor?: string;
  caption?: string;
}

/** Fixed-ratio frame: mask reveal, scroll-scrubbed parallax and optional zoom. Frame size is controlled by the parent column only. */
export default function ImageReveal({ photo, frame = "portrait", sizes = "(min-width: 1024px) 45vw, 100vw", className, priority, parallax = 7, zoom = false, cursor, caption }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      registerGsap();
      if (prefersReducedMotion() || !box.current || !inner.current) return;
      gsap.fromTo(box.current, { clipPath: "inset(10% 8% 10% 8%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.out",
        scrollTrigger: { trigger: box.current, start: "top 88%", once: true },
      });
      gsap.fromTo(inner.current, { yPercent: -parallax, scale: zoom ? 1.28 : 1.14 }, {
        yPercent: parallax, scale: zoom ? 1 : 1.14, ease: "none",
        scrollTrigger: { trigger: box.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: box },
  );
  return (
    <figure className={cn("m-0", className)}>
      <div ref={box} className={cn("frame cap-h", `frame-${frame}`)} data-cursor={cursor}>
        <div ref={inner} className="absolute inset-[-8%] will-change-transform"><Photo photo={photo} sizes={sizes} priority={priority} /></div>
      </div>
      {caption && <figcaption className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted">{caption}</figcaption>}
    </figure>
  );
}
