"use client";
import type { MutableRefObject } from "react";
import { PROJECT_BY_SLUG } from "@/data/projects";
import type { LightMode, MaterialId } from "@/types";
import LivingRoomScene from "./LivingRoomScene";
import MaterialScene from "./MaterialScene";
import SceneCanvas from "./SceneCanvas";
import SpatialScene, { type Focus } from "./SpatialScene";

const quiet = PROJECT_BY_SLUG["quiet-gallery"].preset;

export function HeroCanvas({ progress }: { progress: MutableRefObject<number> }) {
  return (
    <SceneCanvas fallback="/images/hero/living-room.jpg" alt="3D living room with fluted travertine wall, curved boucle sofa and floor-to-ceiling glass" priority fov={38} position={[-4.6, 2.3, 10]} ariaLabel="Interactive 3D living room. Scroll to move through the space.">
      <LivingRoomScene preset={quiet} hero progress={progress} lettering />
    </SceneCanvas>
  );
}

export function SpatialCanvas({ light, wall, floor, focus }: { light: LightMode; wall: MaterialId; floor: MaterialId; focus: Focus }) {
  return (
    <SceneCanvas fallback="/images/architecture/spatial.jpg" alt="Interactive 3D room with selectable lighting and materials" fov={40} position={[-3.2, 1.9, 9.4]}>
      <SpatialScene light={light} wall={wall} floor={floor} focus={focus} />
    </SceneCanvas>
  );
}

export function MaterialCanvas({ material }: { material: MaterialId }) {
  return (
    <SceneCanvas fallback={`/images/materials/${material}.jpg`} alt={`3D samples in ${material}`} fov={34} position={[0, 1.6, 6.2]} shadows>
      <MaterialScene material={material} />
    </SceneCanvas>
  );
}

