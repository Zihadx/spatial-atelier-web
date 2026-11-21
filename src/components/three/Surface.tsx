"use client";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { MATERIAL_BY_ID } from "@/data/materials";
import type { MaterialId } from "@/types";

export type Repeat = [number, number];

export function useSurfaceMaps(id: MaterialId, rx: number, ry: number) {
  const info = MATERIAL_BY_ID[id];
  const [albedo, normal] = useTexture([info.albedo, info.normal]);
  const maps = useMemo(() => {
    const a = albedo.clone();
    const n = normal.clone();
    for (const t of [a, n]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(rx, ry);
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    a.colorSpace = THREE.SRGBColorSpace;
    n.colorSpace = THREE.NoColorSpace;
    return { a, n };
  }, [albedo, normal, rx, ry]);
  useEffect(() => () => { maps.a.dispose(); maps.n.dispose(); }, [maps]);
  return { ...maps, info };
}

interface SurfaceProps {
  id: MaterialId;
  repeat?: Repeat;
  tint?: string;
  roughness?: number;
  metalness?: number;
  normalScale?: number;
  envMapIntensity?: number;
  side?: THREE.Side;
}

/** PBR material driven by the local texture library. Use as a child of a mesh. */
export function Surface({ id, repeat = [1, 1], tint = "#ffffff", roughness, metalness, normalScale = 0.7, envMapIntensity = 1, side }: SurfaceProps) {
  const { a, n, info } = useSurfaceMaps(id, repeat[0], repeat[1]);
  const ns = useMemo(() => new THREE.Vector2(normalScale, normalScale), [normalScale]);
  return (
    <meshStandardMaterial
      map={a}
      normalMap={n}
      normalScale={ns}
      color={tint}
      roughness={roughness ?? info.roughness}
      metalness={metalness ?? info.metalness}
      envMapIntensity={envMapIntensity}
      side={side}
    />
  );
}
