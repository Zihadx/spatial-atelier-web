"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROJECT_PHOTO } from "@/data/photos";
import type { Project } from "@/types";
import Photo from "@/components/ui/Photo";

/** Full-bleed "next chapter" link that closes every case study: the next project's photograph zooms in under the title. */
export default function NextProject({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} data-cursor="Next" className="group surface-ink relative isolate block overflow-hidden">
      <div className="absolute inset-0 -z-20 transition-transform duration-[1800ms] ease-[var(--ease-cine)] group-hover:scale-[1.06]"><Photo photo={PROJECT_PHOTO[project.slug]} sizes="100vw" /></div>
      <div className="absolute inset-0 -z-10 bg-charcoal/65 transition-colors duration-700 group-hover:bg-charcoal/45" aria-hidden />
      <div className="container-x flex min-h-[70svh] flex-col justify-center py-24">
        <p className="eyebrow mb-6 !text-sandstone">Next project</p>
        <h2 className="display-xl max-w-[12ch]">{project.title}</h2>
        <p className="lead mt-6 text-sandstone">{project.summary}</p>
        <span className="btn btn-solid mt-10 self-start">View project <ArrowRight size={16} aria-hidden /></span>
      </div>
    </Link>
  );
}
