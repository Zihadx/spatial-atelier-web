"use client";
import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { Vec3 } from "@/types";

interface Props {
  url: string;
  /** target height in metres; model is normalised to sit on y=0, centred on x/z */
  height: number;
  position?: Vec3;
  rotationY?: number;
  castShadow?: boolean;
  tint?: string;
  envMapIntensity?: number;
}

/** Loads a GLB, strips embedded lights, normalises its size and enables shadows. */
export default function Model({ url, height, position = [0, 0, 0], rotationY = 0, castShadow = true, tint, envMapIntensity = 1 }: Props) {
  const gltf = useGLTF(url);
  const { object, scale, offset } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const lights: THREE.Object3D[] = [];
    clone.traverse((o) => {
      if ((o as THREE.Light).isLight) lights.push(o);
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = castShadow;
        m.receiveShadow = true;
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach((mat, i) => {
          const c = mat.clone() as THREE.MeshStandardMaterial;
          c.envMapIntensity = envMapIntensity;
          const phys = c as THREE.MeshPhysicalMaterial;
          if (tint && phys.sheen > 0 && c.color) {
            // recolour fabric only: drop the baked albedo and re-tint colour + sheen
            c.map = null;
            c.color.set(tint);
            phys.sheenColor?.set(tint).lerp(new THREE.Color("#ffffff"), 0.35);
          }
          if (Array.isArray(m.material)) m.material[i] = c; else m.material = c;
        });
      }
    });
    lights.forEach((l) => l.parent?.remove(l));
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = height / Math.max(size.y, 0.001);
    return { object: clone, scale: s, offset: new THREE.Vector3(-center.x, -box.min.y, -center.z) };
  }, [gltf, height, castShadow, tint, envMapIntensity]);

  return (
    <group position={position} rotation-y={rotationY} scale={scale}>
      <group position={offset}>
        <primitive object={object} />
      </group>
    </group>
  );
}

export const MODELS = {
  chair: "/models/furniture/SheenChair.glb",
  sofa: "/models/furniture/GlamVelvetSofa.glb",
  vase: "/models/objects/GlassVaseFlowers.glb",
  lamp: "/models/lighting/IridescenceLamp.glb",
} as const;
