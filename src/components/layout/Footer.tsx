"use client";
import { useGSAP } from "@gsap/react";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { FOOTER_SERVICES, NAV } from "@/data/navigation";
import { PHOTO } from "@/data/photos";
import { SITE } from "@/lib/constants";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";
import { getLenis } from "@/lib/lenis";
import Button from "@/components/ui/Button";
import Marquee from "@/components/ui/Marquee";
import Photo from "@/components/ui/Photo";
import RevealText from "@/components/ui/RevealText";
import NewsletterForm from "@/components/contact/NewsletterForm";

/** Cinematic ending built from one photograph, a velocity-reactive wordmark ticker and the closing statement. No WebGL. */
export default function Footer() {
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    gsap.fromTo("[data-fbg]", { yPercent: -12, scale: 1.12 }, { yPercent: 0, scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } });
    gsap.from("[data-foot]", { y: 40, autoAlpha: 0, stagger: 0.1, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: "[data-fcols]", start: "top 88%", once: true } });
  }, { scope: root });
  const toTop = () => { const l = getLenis(); if (l) l.scrollTo(0, { duration: 2.2 }); else window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <footer ref={root} className="surface-ink relative isolate overflow-hidden">
      <div data-fbg className="absolute inset-[-4%] -z-20 will-change-transform"><Photo photo={PHOTO.footer} sizes="100vw" /></div>
      <div className="absolute inset-0 -z-10 bg-charcoal/80" aria-hidden />
      <div className="container-x pt-[var(--section-y)]">
        <p className="eyebrow mb-6">Your project starts here</p>
        <RevealText as="h2" className="display-xl max-w-[13ch]">Let&rsquo;s shape a home that <em>feels like yours.</em></RevealText>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-10"><Button href="/contact">Begin a conversation</Button><NewsletterForm /></div>
      </div>
      <Marquee items={["Atelier Verre", "The Living Space"]} className="mt-[var(--section-y)] border-y border-ivory/15 py-6 text-ivory/90" speed={50} />
      <div className="container-x pb-10 pt-16">
        <div data-fcols className="grid gap-12 md:grid-cols-12">
          <div data-foot className="md:col-span-4"><p className="font-display text-3xl">Atelier <em className="text-bronze">Verre</em></p><p className="mt-3 max-w-xs text-sm text-taupe">{SITE.tagline}. A luxury interior architecture studio concept.</p></div>
          <nav data-foot aria-label="Footer" className="md:col-span-2"><p className="eyebrow mb-4">Navigate</p><ul className="space-y-2.5 text-sm">{NAV.map((n) => <li key={n.href}><Link className="transition-colors hover:text-bronze" href={n.href}>{n.label}</Link></li>)}</ul></nav>
          <nav data-foot aria-label="Services" className="md:col-span-3"><p className="eyebrow mb-4">Services</p><ul className="space-y-2.5 text-sm">{FOOTER_SERVICES.map((n) => <li key={n.href}><Link className="transition-colors hover:text-bronze" href={n.href}>{n.label}</Link></li>)}</ul></nav>
          <div data-foot className="md:col-span-3"><p className="eyebrow mb-4">Contact</p><ul className="space-y-2.5 text-sm"><li><a className="transition-colors hover:text-bronze" href={`mailto:${SITE.email}`}>{SITE.email}</a></li><li>{SITE.phone}</li><li className="text-taupe">{SITE.address}</li></ul></div>
        </div>
        <div data-foot className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/15 pt-6 text-xs text-taupe">
          <p>© Atelier Verre. Demonstration concept — projects, testimonials and team are sample content. Photography via Unsplash. <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link></p>
          <button type="button" onClick={toTop} className="link-u text-ivory" aria-label="Back to top">Back to top <ArrowUp size={14} aria-hidden /></button>
        </div>
      </div>
    </footer>
  );
}
