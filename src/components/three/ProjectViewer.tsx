"use client";
import SceneCanvas from "./SceneCanvas";
import LivingRoomScene from "./LivingRoomScene";
import type { Project } from "@/types";

/** Interactive explorable 3D scene for a project (orbit within limits). */
export default function ProjectViewer({ project, className }: { project: Project; className?: string }) {
  return (
    <SceneCanvas
      className={className}
      fallback={project.images[0]}
      alt={`${project.title} — 3D concept render`}
      ariaLabel={`Interactive 3D concept scene for ${project.title}. Drag to look around.`}
      position={project.preset.cam.pos}
      fov={40}
    >
      <LivingRoomScene preset={project.preset} orbit />
    </SceneCanvas>
  );
}
