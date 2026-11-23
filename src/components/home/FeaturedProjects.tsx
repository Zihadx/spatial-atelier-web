"use client";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import Photo from "@/components/ui/Photo";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { PROJECT_PHOTO } from "@/data/photos";
import { CATEGORY_BY_ID, PROJECT_BY_SLUG } from "@/data/projects";
import { gsap, registerGsap } from "@/lib/animations";

const SLUGS = ["quiet-gallery", "walnut-room", "sand-pavilion", "lumen-suite", "penthouse-nocturne"];
const FEATURED = SLUGS.map((s) => PROJECT_BY_SLUG[s]);

/**
 * Pinned horizontal gallery (desktop): vertical scroll drives a single transform on the track, each photo drifts
 * against it (containerAnimation parallax), and a progress rule + counter update without re-rendering React.
 * Below lg (phones, tablets) and with reduced motion it is a native horizontal scroll-snap rail instead: touch swipe,
 * adjacent cards peeking in from the edge, and the same counter + progress rule, driven by the rail's own scrollLeft.
 */
export default function FeaturedProjects({ index = "02" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  /** Mobile/tablet rail: reflect scroll position in the counter + hairline (DOM writes only, no React state). */
  const onRail = () => {
    const t = track.current;
    if (!t || raf.current || window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)").matches) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const max = t.scrollWidth - t.clientWidth;
      const p = max > 0 ? Math.min(1, Math.max(0, t.scrollLeft / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${0.14 + 0.86 * p})`;
      if (count.current) count.current.textContent = String(Math.min(FEATURED.length, Math.round(p * (FEATURED.length - 1)) + 1)).padStart(2, "0");
    });
  };

  useGSAP(() => {
    registerGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!;
      const dist = () => Math.max(0, t.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(t).paddingLeft) * 0);
      const move = gsap.to(t, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: root.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (s) => {
            if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
            if (count.current) count.current.textContent = String(Math.min(FEATURED.length, Math.floor(s.progress * FEATURED.length) + 1)).padStart(2, "0");
          },
        },
      });
      gsap.utils.toArray<HTMLElement>("[data-pan]").forEach((el) => {
        gsap.fromTo(el.querySelector("[data-pimg]"), { xPercent: -7 }, { xPercent: 7, ease: "none", scrollTrigger: { trigger: el, containerAnimation: move, start: "left right", end: "right left", scrub: true } });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className="surface-sand overflow-hidden lg:flex lg:h-svh lg:flex-col lg:justify-center" aria-labelledby="featured-title">
      <div className="container-x w-full pt-[var(--section-y)] lg:pt-0">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel index={index} label="Selected work — concept projects" />
            <h2 id="featured-title" className="display-l">Five rooms, <em>five stories.</em></h2>
          </div>
          <div className="flex items-center gap-4 sm:gap-5" aria-hidden>
            <span className="num text-xl"><span ref={count}>01</span> / {String(FEATURED.length).padStart(2, "0")}</span>
            <span className="relative block h-px w-24 bg-espresso/20 sm:w-40"><span ref={bar} className="absolute inset-0 origin-left scale-x-[0.14] bg-bronze lg:scale-x-0" /></span>
          </div>
        </div>
      </div>
      <ul
        ref={track}
        onScroll={onRail}
        aria-label="Selected concept projects — swipe sideways to browse"
        className="mt-8 flex w-full snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto overscroll-x-contain px-[var(--gutter)] pb-[var(--section-y)] [scrollbar-width:none] sm:gap-6 lg:mt-12 lg:w-max lg:snap-none lg:gap-[3vw] lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden [@media(prefers-reduced-motion:reduce)]:lg:!w-full [@media(prefers-reduced-motion:reduce)]:lg:!overflow-x-auto"
      >
        {FEATURED.map((p, i) => (
          <li key={p.slug} data-pan className="w-[76vw] max-w-[26rem] shrink-0 snap-start sm:w-[56vw] lg:w-[min(52vw,42rem)] lg:max-w-none">
            <Link href={`/projects/${p.slug}`} data-cursor="View" className="group block">
              <div className="frame frame-landscape bg-espresso lg:h-[min(52svh,29rem)] lg:w-full lg:!aspect-auto">
                <div data-pimg className="absolute inset-y-0 -inset-x-[9%]"><Photo photo={PROJECT_PHOTO[p.slug]} sizes="(min-width: 1024px) 52vw, (min-width: 640px) 56vw, 76vw" priority={i === 0} /></div>
                <span className="absolute left-4 top-4 bg-ivory/90 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-espresso">Concept</span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-6">
                <div>
                  <p className="eyebrow mb-1.5">{String(i + 1).padStart(2, "0")} — {CATEGORY_BY_ID[p.category].label}</p>
                  <h3 className="display-s transition-colors duration-500 group-hover:text-bronze">{p.title}</h3>
                </div>
                <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-espresso/30 transition-colors duration-500 group-hover:border-bronze group-hover:bg-bronze group-hover:text-warm-white"><ArrowUpRight size={16} aria-hidden /></span>
              </div>
            </Link>
          </li>
        ))}
        <li className="flex shrink-0 snap-start items-center pr-[var(--gutter)] lg:w-[18rem] lg:pr-0"><Button href="/projects" variant="dark">View all projects</Button></li>
      </ul>
    </section>
  );
}
