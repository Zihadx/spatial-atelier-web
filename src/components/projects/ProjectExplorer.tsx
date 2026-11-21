"use client";
import { ProjectViewer } from "@/components/three/scenes";
import PosterGate from "@/components/three/PosterGate";
import type { Project } from "@/types";

export default function ProjectExplorer({ project }: { project: Project }) {
  const poster = { src: project.images[0], fallback: project.images[0], alt: `${project.title} — 3D concept render` };
  return (
    <div className="relative aspect-[16/10] max-h-[78svh] w-full" data-cursor="Drag">
      <PosterGate poster={poster} label="Explore in 3D" hint="Loads an interactive concept scene (about 2 MB). Drag to look around.">
        <ProjectViewer project={project} />
        <p className="pointer-events-none absolute bottom-4 left-4 bg-charcoal/70 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-ivory backdrop-blur">Drag to look around</p>
      </PosterGate>
    </div>
  );
}
