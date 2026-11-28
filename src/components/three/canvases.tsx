"use client";
import type { LightMode, MaterialId } from "@/types";
import MaterialScene from "./MaterialScene";
import SceneCanvas from "./SceneCanvas";
import SpatialScene, { type Focus } from "./SpatialScene";

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

