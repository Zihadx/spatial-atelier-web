"use client";
import { useGSAP } from "@gsap/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import Photo from "@/components/ui/Photo";
import { PROJECT_PHOTO } from "@/data/photos";
import { CATEGORIES, PROJECTS } from "@/data/projects";
import { Flip, gsap, prefersReducedMotion, registerGsap } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types";
import ProjectCard from "./ProjectCard";

/** Filterable portfolio on an equal 3-column grid. Filtering uses GSAP Flip so surviving cards glide to their new cells. */
export default function ProjectGallery() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const root = useRef<HTMLElement>(null);
  const [view, setView] = useState<"grid" | "index">("grid");
  const state = useRef<Flip.FlipState | null>(null);
  const active = CATEGORIES.find((c) => c.id === params.get("category"))?.id ?? "all";
  const visible = (cat: CategoryId) => active === "all" || cat === active;
  const count = PROJECTS.filter((p) => visible(p.category)).length;

  const set = (id: CategoryId | "all") => {
    registerGsap();
    if (!prefersReducedMotion() && view === "grid") state.current = Flip.getState("[data-card]");
    router.replace(id === "all" ? pathname : `${pathname}?category=${id}`, { scroll: false });
  };

  useGSAP(() => {
    registerGsap();
    if (!state.current) {
      gsap.from("[data-card]", { y: 40, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
      return;
    }
    Flip.from(state.current, {
      targets: "[data-card]", duration: 0.9, ease: "power3.inOut", absolute: true, stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out" }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.92, duration: 0.5 }),
    });
    state.current = null;
  }, { scope: root, dependencies: [active] });

  const switchView = (v: "grid" | "index") => { if (v !== view) { setView(v); } };
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from("[data-view] > *", { y: 30, autoAlpha: 0, stagger: 0.05, duration: 0.8, ease: "power3.out" });
  }, { scope: root, dependencies: [view] });
  const tabs = [{ id: "all" as const, label: "All" }, ...CATEGORIES];
  return (
    <section ref={root} className="surface-warm" aria-label="Project gallery">
      <div className="container-x section">
        <div role="group" aria-label="Filter projects by category" className="mb-10 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.id} type="button" aria-pressed={active === t.id} onClick={() => set(t.id)}
              className={cn("rounded-full border px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-500", active === t.id ? "border-espresso bg-espresso text-ivory" : "border-espresso/25 hover:border-bronze hover:text-bronze")}>{t.label}</button>
          ))}
        </div>
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted" role="status">{count} concept project{count === 1 ? "" : "s"}{active !== "all" && ` in ${CATEGORIES.find((c) => c.id === active)?.label}`}</p>
          <div role="group" aria-label="View" className="flex gap-1">
            {([["grid", LayoutGrid, "Grid"], ["index", List, "Index"]] as const).map(([k, Icon, l]) => (
              <button key={k} type="button" aria-pressed={view === k} onClick={() => switchView(k)} className={cn("flex items-center gap-2 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors", view === k ? "bg-espresso text-ivory" : "hover:text-bronze")}><Icon size={14} aria-hidden />{l}</button>
            ))}
          </div>
        </div>
        {view === "grid" ? (
          <ul data-view className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p, i) => (
              <li key={p.slug} data-card style={{ display: visible(p.category) ? undefined : "none" }}><ProjectCard project={p} index={i} priority={i < 3} /></li>
            ))}
          </ul>
        ) : (
          <ul data-view className="border-t border-espresso/20">
            {PROJECTS.filter((p) => visible(p.category)).map((p) => (
              <li key={p.slug} className="group relative border-b border-espresso/20">
                <Link href={`/projects/${p.slug}`} data-cursor="View" className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 transition-[padding] duration-500 group-hover:pl-4 md:grid-cols-[4rem_1.4fr_1fr_1fr_10rem] md:py-7">
                  <span className="num text-sm text-muted">{String(PROJECTS.indexOf(p) + 1).padStart(2, "0")}</span>
                  <span className="display-s transition-colors group-hover:text-bronze">{p.title}</span>
                  <span className="hidden text-sm text-muted md:block">{CATEGORIES.find((c) => c.id === p.category)?.label}</span>
                  <span className="hidden text-sm text-muted md:block">{p.type}</span>
                  <span className="relative hidden h-14 w-full overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block"><Photo photo={PROJECT_PHOTO[p.slug]} sizes="160px" /></span>
                  <span className="text-xs uppercase tracking-[0.16em] text-muted md:hidden">{p.type}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
