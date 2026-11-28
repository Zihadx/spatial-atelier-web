"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { PROJECT_PHOTO } from "@/data/photos";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import Photo from "@/components/ui/Photo";

interface Props {
  project: Project;
  categoryLabel: string;
  index?: number;
  className?: string;
  priority?: boolean;
  frame?: "frame-portrait" | "frame-landscape" | "frame-square";
}

/** Uniform portfolio tile: fixed frame ratios only, pointer-driven depth on hover. */
export default function ProjectCard({ project, categoryLabel, index, className, priority, frame = "frame-portrait" }: Props) {
  const el = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    const r = el.current?.getBoundingClientRect(); if (!r || !el.current) return;
    el.current.style.setProperty("--mx", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    el.current.style.setProperty("--my", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const leave = () => { el.current?.style.setProperty("--mx", "0"); el.current?.style.setProperty("--my", "0"); };
  return (
    <Link ref={el} href={`/projects/${project.slug}`} data-cursor="View" onPointerMove={move} onPointerLeave={leave} className={cn("group block", className)} style={{ ["--mx" as string]: 0, ["--my" as string]: 0 }}>
      <div className={cn("frame bg-espresso", frame)}>
        <div className="absolute inset-[-5%] transition-transform duration-[1400ms] ease-[var(--ease-cine)] group-hover:scale-[1.05]" style={{ transform: "translate3d(calc(var(--mx) * -10px), calc(var(--my) * -10px), 0)" }}>
          <Photo photo={PROJECT_PHOTO[project.slug]} priority={priority} sizes="(min-width: 1024px) 33vw, 100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" aria-hidden />
        <span className="absolute left-4 top-4 bg-ivory/90 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-espresso">Concept</span>
        <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/95 text-espresso opacity-0 transition-opacity duration-500 group-hover:opacity-100"><ArrowUpRight size={16} aria-hidden /></span>
        {index !== undefined && <span className="num absolute bottom-3 right-4 text-2xl text-ivory/85">{String(index + 1).padStart(2, "0")}</span>}
      </div>
      <div className="mt-4">
        <p className="eyebrow mb-1">{categoryLabel}</p>
        <h3 className="display-s transition-colors duration-500 group-hover:text-bronze">{project.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{project.summary}</p>
      </div>
    </Link>
  );
}
