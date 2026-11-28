"use client";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import Photo from "@/components/ui/Photo";
import SectionHeading from "@/components/ui/SectionHeading";
import { CATEGORY_PHOTO } from "@/data/photos";
import type { Category, Project } from "@/content";
import { gsap, isCoarsePointer, prefersReducedMotion, registerGsap } from "@/lib/animations";

/** Large typographic index. On fine pointers a photograph follows the cursor and crossfades per row; on touch each row shows a thumbnail. */
export default function ProjectCategories({ index = "03", categories: CATEGORIES, projects: PROJECTS }: { index?: string; categories: Category[]; projects: Project[] }) {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    registerGsap();
    const pv = preview.current;
    gsap.from("[data-row]", { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 70%", once: true } });
    if (!pv || isCoarsePointer() || prefersReducedMotion()) return;
    const x = gsap.quickTo(pv, "x", { duration: 0.6, ease: "power3.out" });
    const y = gsap.quickTo(pv, "y", { duration: 0.6, ease: "power3.out" });
    const list = root.current!.querySelector("ul")!;
    const move = (e: PointerEvent) => { const r = list.getBoundingClientRect(); x(e.clientX - r.left + 40); y(e.clientY - r.top - 130); };
    const imgs = gsap.utils.toArray<HTMLElement>("[data-pimg]");
    const show = (i: number) => {
      gsap.to(pv, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      imgs.forEach((im, n) => gsap.to(im, { autoAlpha: n === i ? 1 : 0, duration: 0.5 }));
    };
    const hide = () => gsap.to(pv, { autoAlpha: 0, scale: 0.92, duration: 0.4, overwrite: "auto" });
    const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
    const cleanups: (() => void)[] = [];
    rows.forEach((row, i) => {
      const fill = row.querySelector("[data-fill]");
      const on = () => { show(i); gsap.to(fill, { scaleY: 1, duration: 0.6, ease: "expo.out" }); gsap.to(row.querySelector("[data-name]"), { x: 18, duration: 0.6, ease: "expo.out" }); };
      const off = () => { gsap.to(fill, { scaleY: 0, duration: 0.5, ease: "expo.out" }); gsap.to(row.querySelector("[data-name]"), { x: 0, duration: 0.5, ease: "expo.out" }); };
      row.addEventListener("pointerenter", on); row.addEventListener("pointerleave", off);
      cleanups.push(() => { row.removeEventListener("pointerenter", on); row.removeEventListener("pointerleave", off); });
    });
    list.addEventListener("pointermove", move); list.addEventListener("pointerleave", hide);
    return () => { cleanups.forEach((c) => c()); list.removeEventListener("pointermove", move); list.removeEventListener("pointerleave", hide); };
  }, { scope: root });

  return (
    <section ref={root} className="surface-ink" aria-labelledby="cat-title">
      <div className="container-x section">
        <SectionHeading index={index} eyebrow="Explore by type" title={<span id="cat-title">Six ways of <em>living in space.</em></span>} />
        <div className="relative mt-14">
          <ul className="border-t border-ivory/20">
            {CATEGORIES.map((c, i) => {
              const n = PROJECTS.filter((p) => p.category === c.id).length;
              return (
                <li key={c.id} data-row className="relative overflow-hidden border-b border-ivory/20">
                  <span data-fill className="absolute inset-0 origin-bottom scale-y-0 bg-espresso" aria-hidden />
                  <Link href={`/projects?category=${c.id}`} className="relative grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-6 md:grid-cols-[5rem_1fr_16rem_3rem] md:py-8">
                    <span className="num text-sm text-taupe">{String(i + 1).padStart(2, "0")}</span>
                    <span data-name className="display-m">{c.label}</span>
                    <span className="hidden text-sm text-taupe md:block">{c.blurb}</span>
                    <span className="flex items-center justify-end gap-4 text-sm text-taupe"><span className="num">{n}</span><ArrowUpRight size={18} aria-hidden /></span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div ref={preview} aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[17rem] w-[13rem] overflow-hidden bg-espresso opacity-0 md:block">
            {CATEGORIES.map((c, i) => (
              <div key={c.id} data-pimg className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}><Photo photo={CATEGORY_PHOTO[c.id]} sizes="208px" /></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
