"use client";
import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { LightMode, MaterialId, Vec3 } from "@/types";
import { PROJECT_BY_SLUG } from "@/data/projects";
import Furnishings from "./Furnishings";
import Lighting from "./Lighting";
import RoomShell from "./RoomShell";
import { LIGHT } from "./lighting.config";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type Focus = "space" | "light" | "form" | "material" | "texture" | "proportion";

export const FOCUS_VIEWS: Record<Focus, { pos: Vec3; look: Vec3 }> = {
  space: { pos: [-3.2, 1.9, 9.4], look: [1.2, 1.2, -2.4] },
  light: { pos: [-2.0, 1.5, 3.4], look: [6, 1.9, 0.5] },
  form: { pos: [-0.4, 1.3, 2.6], look: [0.9, 0.7, -1.6] },
  material: { pos: [1.2, 1.7, -2.4], look: [-0.5, 1.7, -6] },
  texture: { pos: [1.6, 1.0, 1.0], look: [0.9, 0.5, -1.4] },
  proportion: { pos: [-5.2, 2.4, 9.2], look: [0.6, 1.4, -2.4] },
};

function Camera({ focus }: { focus: Focus }) {
  const { camera, pointer } = useThree();
  const reduced = useReducedMotion();
  const look = useRef(new THREE.Vector3(...FOCUS_VIEWS.space.look));
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const v = FOCUS_VIEWS[focus];
    const k = reduced ? 1 : 1 - Math.exp(-2.6 * dt);
    target.set(v.pos[0] + (reduced ? 0 : pointer.x * 0.25), v.pos[1] + (reduced ? 0 : pointer.y * 0.12), v.pos[2]);
    camera.position.lerp(target, k);
    look.current.lerp(new THREE.Vector3(...v.look), k);
    camera.lookAt(look.current);
  });
  return null;
}

function Proportion({ show }: { show: boolean }) {
  if (!show) return null;
  const c = "#A88C67";
  const lines: Vec3[][] = [
    [[-6, 0.02, 2.6], [6, 0.02, 2.6]],
    [[-6, 3.4, -5.8], [6, 3.4, -5.8]],
    [[-5.9, 0, -5.8], [-5.9, 3.4, -5.8]],
    [[0.9 - 2.7, 0.03, -0.9], [0.9 + 2.7, 0.03, -0.9]],
    [[3.6, 0, -4.2], [3.6, 0.95, -4.2]],
  ];
  return (
    <group>
      {lines.map((l, i) => <Line key={i} points={l} color={c} lineWidth={2} dashed dashSize={0.18} gapSize={0.12} />)}
      <mesh position={[0.9, 0.04, -1.6]} rotation-x={-Math.PI / 2}><ringGeometry args={[3.0, 3.04, 96]} /><meshBasicMaterial color={c} toneMapped={false} /></mesh>
      <mesh position={[0.9, 0.04, -1.6]} rotation-x={-Math.PI / 2}><ringGeometry args={[1.75, 1.78, 96]} /><meshBasicMaterial color={c} toneMapped={false} /></mesh>
    </group>
  );
}

function Highlight({ focus }: { focus: Focus }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const m = ref.current; if (!m) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.03;
    m.scale.set(s, s, s);
  });
  if (focus !== "form" && focus !== "texture") return null;
  return (
    <mesh ref={ref} position={[0.9, 0.05, -1.2]} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[2.9, 2.95, 96, 1, 0.14 * Math.PI, 0.72 * Math.PI]} />
      <meshBasicMaterial color="#F5F1E9" toneMapped={false} />
    </mesh>
  );
}

export default function SpatialScene({ light, wall, floor, focus }: { light: LightMode; wall: MaterialId; floor: MaterialId; focus: Focus }) {
  const preset = PROJECT_BY_SLUG["quiet-gallery"].preset;
  const rig = LIGHT[light];
  return (
    <>
      <color attach="background" args={[rig.fog]} />
      <fog attach="fog" args={[rig.fog, 18, 44]} />
      <Lighting mode={light} windowSide="right" />
      <RoomShell wall={wall} floor={floor} mode={light} glass="right" fluted={wall === "travertine" || wall === "plaster"} reflective />
      <Furnishings layout="gallery" mode={light} textile={preset.textile} />
      <Proportion show={focus === "proportion"} />
      <Highlight focus={focus} />
      <Camera focus={focus} />
    </>
  );
}
