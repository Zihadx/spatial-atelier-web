"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { NAV } from "@/data/navigation";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    registerGsap();
    if (prefersReducedMotion()) return;
    gsap.to(bar.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => { const hide = self.direction === 1 && self.scroll() > 600; gsap.to(header.current, { yPercent: hide ? -100 : 0, duration: 0.6, ease: "power3.out", overwrite: "auto" }); } });
  }, { scope: header });
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]); // eslint-disable-line react-hooks/set-state-in-effect
  return (
    <>
      <header
        ref={header}
        className={cn(
          "fixed inset-x-0 top-0 z-50 text-ivory transition-[background-color,backdrop-filter,padding] duration-700",
          scrolled ? "bg-espresso/75 py-3 backdrop-blur-xl" : "bg-transparent py-6",
        )}
        style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + ${scrolled ? "0.75rem" : "1.5rem"})` }}
      >
        <nav aria-label="Primary" className="container-x flex items-center justify-between">
          <Link href="/" className="font-display text-[1.7rem] leading-none tracking-tight" aria-label="Atelier Verre — home">
            Atelier <em className="text-bronze">Verre</em>
          </Link>
          <ul className="hidden items-center gap-9 lg:flex">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? "page" : undefined} className={cn("group relative text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-colors hover:text-bronze", active && "text-bronze")}>
                    {n.label}
                    <span className={cn("absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-bronze transition-transform duration-500 group-hover:scale-x-100", active && "scale-x-100")} />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/contact" className="btn btn-line hidden !py-3 lg:inline-flex">Begin a project</Link>
          <button type="button" className="btn btn-line !py-3 lg:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
            Menu
          </button>
        </nav>
        <span ref={bar} aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-bronze" />
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
