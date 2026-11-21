"use client";
import { Environment, Lightformer, RoundedBox, ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { MaterialId } from "@/types";
import { MATERIAL_BY_ID } from "@/data/materials";
import { Surface, useSurfaceMaps } from "./Surface";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function GlassMat() {
  const { n } = useSurfaceMaps("glass", 2, 1);
  return <meshPhysicalMaterial color="#DCE6DD" roughness={0.12} transmission={0.92} thickness={0.5} ior={1.45} normalMap={n} normalScale={new THREE.Vector2(1.4, 1.4)} envMapIntensity={1.5} />;
}

function Mat({ id, repeat = [1, 1] as [number, number] }: { id: MaterialId; repeat?: [number, number] }) {
  if (id === "glass") return <GlassMat />;
  const info = MATERIAL_BY_ID[id];
  return <Surface id={id} repeat={repeat} normalScale={id === "boucle" || id === "linen" ? 1.2 : 0.9} metalness={info.metalness} roughness={info.roughness} />;
}

/** Rotating sample set (slab, sphere, block) for the selected material, in a controlled studio rig. */
export default function MaterialScene({ material }: { material: MaterialId }) {
  const g = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();
  useFrame(({ pointer }, dt) => {
    const m = g.current; if (!m) return;
    if (!reduced) m.rotation.y += dt * 0.22;
    m.rotation.x = THREE.MathUtils.damp(m.rotation.x, -pointer.y * 0.15, 4, dt);
  });
  const textile = material === "boucle" || material === "linen";
  return (
    <>
      <color attach="background" args={["#242421"]} />
      <hemisphereLight args={["#FAF8F4", "#332B24", 0.5]} />
      <spotLight position={[4, 6, 5]} angle={0.5} penumbra={0.8} intensity={140} color="#FFE7C4" castShadow shadow-mapSize={[1024, 1024]} />
      <Environment key={material} resolution={256} frames={1} background={false}>
        <Lightformer form="rect" intensity={4} color="#FFE7C4" position={[5, 3, 3]} scale={[6, 4, 1]} rotation-y={-Math.PI / 3} />
        <Lightformer form="rect" intensity={2} color="#FAF8F4" position={[-5, 4, 2]} scale={[5, 5, 1]} rotation-y={Math.PI / 3} />
        <Lightformer form="rect" intensity={2.5} color="#A88C67" position={[0, 2, -6]} scale={[10, 3, 1]} />
      </Environment>
      <group ref={g} position={[0, 0.1, 0]}>
        <mesh position={[0, 0.05, 0]} castShadow receiveShadow><cylinderGeometry args={[2.1, 2.1, 0.1, 64]} /><meshStandardMaterial color="#332B24" roughness={0.6} metalness={0.2} /></mesh>
        <RoundedBox args={[1.8, 0.16, 1.3]} radius={0.03} position={[-0.7, 0.5, 0.65]} rotation={[0, 0.5, 0]} castShadow receiveShadow><Mat id={material} repeat={[0.7, 0.7]} /></RoundedBox>
        <mesh position={[0.85, 0.85, -0.2]} castShadow receiveShadow><sphereGeometry args={[0.72, 96, 64]} /><Mat id={material} repeat={textile ? [0.6, 0.6] : [0.8, 0.6]} /></mesh>
        <RoundedBox args={[0.9, 1.5, 0.9]} radius={0.04} smoothness={4} position={[-0.9, 0.9, -0.7]} rotation={[0, -0.3, 0]} castShadow receiveShadow><Mat id={material} repeat={[0.6, 1]} /></RoundedBox>
      </group>
      <ContactShadows position={[0, 0.02, 0]} opacity={0.55} scale={9} blur={2.4} far={3} />
    </>
  );
}
