"use client";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Photo from "@/components/ui/Photo";
import { SERVICE_PHOTO } from "@/data/photos";
import { SERVICES } from "@/data/services";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/animations";

/** Left: sticky photo that wipes between services as each section crosses the viewport centre (ScrollTrigger). Right: the detail. */
export default function ServiceShowcase() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    const imgs = gsap.utils.toArray<HTMLElement>("[data-simg]");
    SERVICES.forEach((_, i) => {
      ScrollTrigger.create({
        trigger: `#${SERVICES[i].id}`, start: "top 55%", end: "bottom 55%",
        onToggle: (self) => {
          if (!self.isActive) return;
          setActive(i);
          imgs.forEach((im, n) => {
            if (n === i) gsap.fromTo(im, { clipPath: "inset(100% 0% 0% 0%)", scale: 1.15, zIndex: 2, autoAlpha: 1 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.1, ease: "expo.out" });
            else gsap.set(im, { zIndex: 1, autoAlpha: n === i - 1 ? 1 : 0, overwrite: false });
          });
        },
      });
    });
  }, { scope: root });
  return (
    <section ref={root} className="surface-warm" aria-label="Services in detail">
      <div className="container-x grid lg:grid-cols-12 lg:gap-x-16">
        <div className="sticky top-[4.5rem] z-10 -mx-[var(--gutter)] h-[34svh] lg:order-2 lg:col-span-5 lg:mx-0 lg:h-auto">
          <div className="frame h-full bg-espresso lg:sticky lg:top-24 lg:aspect-[4/5] lg:h-[min(74svh,40rem)]">
            {SERVICES.map((s, n) => <div key={s.id} data-simg className="absolute inset-0" style={{ opacity: n === 0 ? 1 : 0 }}><Photo photo={SERVICE_PHOTO[s.id]} sizes="(min-width: 1024px) 40vw, 100vw" priority={n === 0} /></div>)}
            <span className="num absolute bottom-3 right-4 z-10 text-3xl text-ivory">{SERVICES[active].n}</span>
          </div>
        </div>
        <div className="lg:order-1 lg:col-span-7">
          {SERVICES.map((s) => (
            <article key={s.id} id={s.id} className="flex min-h-[72svh] scroll-mt-32 flex-col justify-center border-t border-espresso/15 py-16">
              <p className="num text-6xl text-bronze">{s.n}</p>
              <h2 className="display-m mt-3">{s.title}</h2>
              <p className="display-s mt-5 text-espresso/80">{s.lead}</p>
              <p className="mt-5 max-w-md text-espresso/75">{s.body}</p>
              <ul className="mt-7 space-y-2 text-sm">{s.scope.map((x) => <li key={x} className="flex gap-3"><span className="text-bronze">—</span>{x}</li>)}</ul>
              <Link href="/contact" className="link-u mt-8 self-start">Enquire about this service <ArrowRight size={14} aria-hidden /></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
