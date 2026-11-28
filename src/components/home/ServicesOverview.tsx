"use client";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Photo from "@/components/ui/Photo";
import SectionHeading from "@/components/ui/SectionHeading";
import { SERVICE_PHOTO } from "@/data/photos";
import type { Service } from "@/content";
import { gsap, registerGsap } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** Sticky photograph that crossfades (clip-path wipe + scale) as the active service changes; list is the control. */
export default function ServicesOverview({ index = "06", services: SERVICES }: { index?: string; services: Service[] }) {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const prev = useRef(0);
  const select = (n: number) => {
    if (n === prev.current) return;
    const imgs = gsap.utils.toArray<HTMLElement>("[data-simg]", root.current);
    const dir = n > prev.current ? 1 : -1;
    gsap.set(imgs[n], { zIndex: 2, clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", scale: 1.15, autoAlpha: 1 });
    gsap.to(imgs[n], { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.1, ease: "expo.out" });
    gsap.set(imgs[prev.current], { zIndex: 1 });
    gsap.to(imgs[prev.current], { autoAlpha: 0, duration: 0.01, delay: 1.1 });
    gsap.fromTo(root.current!.querySelector("[data-scopelist]"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" });
    prev.current = n; setI(n);
  };
  useGSAP(() => {
    registerGsap();
    gsap.from("[data-srow]", { x: -30, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 65%", once: true } });
  }, { scope: root });
  const s = SERVICES[i];
  return (
    <section ref={root} className="surface-warm" aria-labelledby="svc-title">
      <div className="container-x section">
        <SectionHeading index={index} eyebrow="Services" title={<span id="svc-title">Seven disciplines, <em>one point of view.</em></span>} />
        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="frame frame-portrait cap-h bg-espresso">
                {SERVICES.map((x, n) => (
                  <div key={x.id} data-simg className="absolute inset-0" style={{ opacity: n === 0 ? 1 : 0, zIndex: n === 0 ? 1 : 0 }}><Photo photo={SERVICE_PHOTO[x.id]} sizes="(min-width: 1024px) 40vw, 100vw" priority={n === 0} /></div>
                ))}
                <span className="num absolute bottom-4 right-5 z-10 text-4xl text-ivory">{s.n}</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ul>
              {SERVICES.map((x, n) => (
                <li key={x.id} data-srow className="border-t border-espresso/15 last:border-b">
                  <button type="button" onMouseEnter={() => select(n)} onFocus={() => select(n)} onClick={() => select(n)} aria-pressed={n === i} className="group flex w-full items-baseline gap-5 py-5 text-left md:py-6">
                    <span className="num w-8 text-sm text-muted">{x.n}</span>
                    <span className={cn("display-s transition-all duration-500", n === i ? "translate-x-2 text-bronze" : "group-hover:translate-x-1")}>{x.title}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div data-scopelist className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end" aria-live="polite">
              <div><p className="display-s">{s.lead}</p><p className="mt-3 max-w-md text-sm text-muted">{s.body}</p></div>
              <Link href={`/services#${s.id}`} className="link-u">Explore <ArrowRight size={14} aria-hidden /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
