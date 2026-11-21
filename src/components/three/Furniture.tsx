"use client";
import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { MaterialId, Vec3 } from "@/types";
import { Surface } from "./Surface";
import Model, { MODELS } from "./Model";

type P = { position?: Vec3; rotationY?: number; scale?: number };

export const faceTo = (from: Vec3, to: Vec3) => Math.atan2(to[0] - from[0], to[2] - from[2]);

/** Seeded PRNG so server/client and renders stay deterministic. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function CurvedSofa({ position = [0, 0, 0], rotationY = 0, scale = 1, textile = "boucle" as MaterialId }: P & { textile?: MaterialId }) {
  const { seat, back } = useMemo(() => {
    const ring = (s: THREE.Shape, ro: number, ri: number, a0: number, a1: number) => {
      s.absarc(0, 0, ro, a0, a1, false);
      s.absarc(0, 0, ri, a1, a0, true);
    };
    const sh = new THREE.Shape(); ring(sh, 2.7, 1.75, 0.14 * Math.PI, 0.86 * Math.PI);
    const sf = new THREE.Shape(); ring(sf, 2.72, 2.38, 0.14 * Math.PI, 0.86 * Math.PI);
    const mk = (shape: THREE.Shape, depth: number) => {
      const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 4, curveSegments: 64 });
      g.rotateX(-Math.PI / 2);
      return g;
    };
    return { seat: mk(sh, 0.42), back: mk(sf, 0.95) };
  }, []);
  return (
    <group position={position} rotation-y={rotationY} scale={scale}>
      <mesh geometry={seat} position={[0, 0.12, 0]} castShadow receiveShadow><Surface id={textile} repeat={[0.45, 0.45]} roughness={1} normalScale={1.1} /></mesh>
      <mesh geometry={back} position={[0, 0.12, 0]} castShadow receiveShadow><Surface id={textile} repeat={[0.45, 0.45]} roughness={1} normalScale={1.1} /></mesh>
      {[0.17, 0.83].map((a) => (
        <mesh key={a} position={[Math.cos(a * Math.PI) * 2.2, 0.06, -Math.sin(a * Math.PI) * 2.2]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.5]} /><Surface id="bronze" />
        </mesh>
      ))}
    </group>
  );
}

export function LatheBase({ position = [0, 0, 0], scale = 1, material = "bronze" as MaterialId, height = 0.38 }: P & { material?: MaterialId; height?: number }) {
  const geo = useMemo(() => {
    const pts = [[0.001, 0], [0.42, 0], [0.45, 0.03], [0.33, 0.13], [0.21, 0.28], [0.22, 0.36], [0.26, 0.38], [0.001, 0.38]].map(([x, y]) => new THREE.Vector2(x, y * (height / 0.38)));
    return new THREE.LatheGeometry(pts, 64);
  }, [height]);
  return <mesh geometry={geo} position={position} scale={scale} castShadow receiveShadow><Surface id={material} repeat={[3, 1]} roughness={0.34} metalness={1} /></mesh>;
}

export function CoffeeTable({ position = [0, 0, 0], top = "travertine" as MaterialId, radius = 0.85 }: P & { top?: MaterialId; radius?: number }) {
  return (
    <group position={position}>
      <LatheBase />
      <mesh position={[0, 0.41, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.07, 72]} /><Surface id={top} repeat={[0.8, 0.8]} />
      </mesh>
      <mesh position={[0, 0.41, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[radius, 0.012, 8, 96]} /><Surface id="bronze" repeat={[8, 1]} />
      </mesh>
      <mesh position={[0.22, 0.51, -0.18]} castShadow><sphereGeometry args={[0.13, 32, 24]} /><Surface id="bronze" roughness={0.25} metalness={1} /></mesh>
    </group>
  );
}

export function Rug({ position = [0, 0, 0], radius = 2.6, material = "linen" as MaterialId, tint = "#F5F1E9", rect }: P & { radius?: number; material?: MaterialId; tint?: string; rect?: [number, number] }) {
  return (
    <mesh position={[position[0], 0.012, position[2]]} rotation-x={-Math.PI / 2} receiveShadow>
      {rect ? <planeGeometry args={rect} /> : <circleGeometry args={[radius, 72]} />}
      <Surface id={material} repeat={[5, 5]} tint={tint} roughness={1} normalScale={0.8} />
    </mesh>
  );
}

export function FloorLamp({ position = [0, 0, 0], glow = 0.3, color = "#FFD9A0" }: P & { glow?: number; color?: string }) {
  const shade = glow > 0.5 ? color : "#EDE1CC";
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} castShadow><cylinderGeometry args={[0.22, 0.26, 0.04, 40]} /><Surface id="bronze" /></mesh>
      <mesh position={[0, 0.98, 0]} castShadow><cylinderGeometry args={[0.014, 0.014, 1.9, 12]} /><Surface id="bronze" roughness={0.3} metalness={1} /></mesh>
      <mesh position={[0, 2.05, 0]}><sphereGeometry args={[0.3, 32, 24]} /><meshBasicMaterial color={shade} toneMapped={false} /></mesh>
      <pointLight position={[0, 2, 0]} color={color} intensity={glow * 7} distance={9} decay={2} />
    </group>
  );
}

export function Pendant({ position = [0, 3.4, 0], drop = 1.2, glow = 0.5, color = "#FFD9A0", radius = 0.32 }: P & { drop?: number; glow?: number; color?: string; radius?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, -drop / 2, 0]}><cylinderGeometry args={[0.006, 0.006, drop, 6]} /><meshStandardMaterial color="#332B24" /></mesh>
      <mesh position={[0, -drop, 0]} castShadow>
        <sphereGeometry args={[radius, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <Surface id="bronze" side={THREE.DoubleSide} roughness={0.35} metalness={1} />
      </mesh>
      <mesh position={[0, -drop - radius * 0.2, 0]}><sphereGeometry args={[radius * 0.45, 24, 16]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
      <pointLight position={[0, -drop - radius, 0]} color={color} intensity={glow * 4} distance={7} decay={2} />
    </group>
  );
}

export function Sideboard({ position = [0, 0, 0], width = 3.6, material = "walnut" as MaterialId, withObjects = true, lamp = true }: P & { width?: number; material?: MaterialId; withObjects?: boolean; lamp?: boolean }) {
  return (
    <group position={position}>
      <RoundedBox args={[width, 0.62, 0.46]} radius={0.015} position={[0, 0.31 + 0.12, 0]} castShadow receiveShadow>
        <Surface id={material} repeat={[1.2, 0.5]} />
      </RoundedBox>
      <mesh position={[0, 0.06, 0]}><boxGeometry args={[width - 0.2, 0.12, 0.4]} /><meshStandardMaterial color="#242421" roughness={0.8} /></mesh>
      {withObjects && (
        <>
          <Model url={MODELS.vase} height={0.52} position={[width * 0.3, 0.74, 0]} />
          {lamp && <Model url={MODELS.lamp} height={0.55} position={[-width * 0.32, 0.74, 0]} />}
          <mesh position={[0, 0.78, 0.02]} castShadow><boxGeometry args={[0.3, 0.05, 0.22]} /><Surface id="oak" /></mesh>
          <mesh position={[0, 0.83, 0.02]} castShadow><boxGeometry args={[0.26, 0.04, 0.2]} /><Surface id="travertine" /></mesh>
        </>
      )}
    </group>
  );
}

export function Art({ position = [0, 1.7, -5.8], size = [1.6, 2.1] as [number, number], material = "plaster" as MaterialId }: { position?: Vec3; size?: [number, number]; material?: MaterialId }) {
  return (
    <group position={position}>
      <mesh castShadow><boxGeometry args={[size[0] + 0.08, size[1] + 0.08, 0.05]} /><Surface id="bronze" /></mesh>
      <mesh position={[0, 0, 0.03]}><planeGeometry args={size} /><Surface id={material} repeat={[1, 1.3]} tint="#E6D9C3" normalScale={1.6} /></mesh>
    </group>
  );
}

export function Chair({ position, look, height = 0.84, tint = "#D9CBB8" }: { position: Vec3; look: Vec3; height?: number; tint?: string }) {
  return <Model url={MODELS.chair} height={height} position={position} rotationY={faceTo(position, look)} tint={tint} />;
}

const BOOK_COLORS = ["#60432F", "#332B24", "#A99B88", "#D9CBB8", "#F5F1E9", "#A88C67", "#AAB7A1", "#777168"];

export function Shelving({ width = 11, height = 3.2, z = -5.75, rows = 5 }: { width?: number; height?: number; z?: number; rows?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const books = useMemo(() => {
    const r = rng(42);
    const out: { x: number; y: number; w: number; h: number; c: THREE.Color }[] = [];
    for (let row = 0; row < rows; row++) {
      let x = -width / 2 + 0.2;
      const y = 0.5 + row * ((height - 0.6) / rows);
      while (x < width / 2 - 0.5) {
        if (r() < 0.12) { x += 0.35 + r() * 0.5; continue; }
        const w = 0.03 + r() * 0.05;
        const h = 0.24 + r() * 0.12;
        out.push({ x: x + w / 2, y: y + h / 2, w, h, c: new THREE.Color(BOOK_COLORS[Math.floor(r() * BOOK_COLORS.length)]) });
        x += w + 0.004;
      }
    }
    return out;
  }, [width, height, rows]);
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    const d = new THREE.Object3D();
    books.forEach((b, i) => { d.position.set(b.x, b.y, 0); d.scale.set(b.w, b.h, 0.22); d.updateMatrix(); m.setMatrixAt(i, d.matrix); m.setColorAt(i, b.c); });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [books]);
  return (
    <group position={[0, 0, z]}>
      {Array.from({ length: rows + 1 }, (_, i) => (
        <mesh key={i} position={[0, 0.5 + i * ((height - 0.6) / rows) - 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.04, 0.34]} /><Surface id="walnut" repeat={[2, 0.2]} tint="#C9B9A5" />
        </mesh>
      ))}
      {[-width / 2, -width / 6, width / 6, width / 2].map((x) => (
        <mesh key={x} position={[x, height / 2 + 0.1, 0]} castShadow><boxGeometry args={[0.04, height - 0.1, 0.34]} /><Surface id="walnut" repeat={[0.2, 2]} tint="#C9B9A5" /></mesh>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, books.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={0.78} />
      </instancedMesh>
    </group>
  );
}

export function PlatformBed({ position = [0, 0, 0] }: P) {
  return (
    <group position={position}>
      <RoundedBox args={[2.6, 0.36, 2.3]} radius={0.04} position={[0, 0.18, 0]} castShadow receiveShadow><Surface id="plaster" repeat={[1.5, 1.5]} /></RoundedBox>
      <RoundedBox args={[2.4, 0.26, 2.1]} radius={0.08} smoothness={4} position={[0, 0.5, 0]} castShadow receiveShadow><Surface id="linen" repeat={[3, 3]} roughness={1} /></RoundedBox>
      <RoundedBox args={[2.5, 1.2, 0.18]} radius={0.06} position={[0, 0.9, -1.1]} castShadow receiveShadow><Surface id="boucle" repeat={[0.8, 0.8]} roughness={1} /></RoundedBox>
      {[-0.6, 0.6].map((x) => (
        <RoundedBox key={x} args={[0.8, 0.42, 0.18]} radius={0.08} smoothness={4} position={[x, 0.82, -0.75]} rotation-x={-0.25} castShadow><Surface id="boucle" repeat={[0.8, 0.8]} roughness={1} /></RoundedBox>
      ))}
    </group>
  );
}

export function LongTable({ position = [0, 0, 0], length = 6, depth = 1.3, material = "oak" as MaterialId }: P & { length?: number; depth?: number; material?: MaterialId }) {
  return (
    <group position={position}>
      <RoundedBox args={[length, 0.07, depth]} radius={0.015} position={[0, 0.74, 0]} castShadow receiveShadow><Surface id={material} repeat={[1.6, 0.6]} /></RoundedBox>
      {[-length / 2 + 0.5, length / 2 - 0.5].map((x) => (
        <mesh key={x} position={[x, 0.37, 0]} castShadow><boxGeometry args={[0.06, 0.74, depth - 0.3]} /><Surface id="bronze" roughness={0.35} metalness={1} /></mesh>
      ))}
    </group>
  );
}

export function Planter({ position = [0, 0, 0], radius = 1.3 }: P & { radius?: number }) {
  const leaves = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 9 }, () => ({ p: [(r() - 0.5) * 1.6, 2.6 + r() * 0.9, (r() - 0.5) * 1.6] as Vec3, s: 0.55 + r() * 0.5 }));
  }, []);
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow><cylinderGeometry args={[radius, radius + 0.05, 0.4, 56]} /><Surface id="stone" repeat={[3, 0.4]} /></mesh>
      <mesh position={[0, 0.41, 0]}><cylinderGeometry args={[radius - 0.1, radius - 0.1, 0.04, 40]} /><meshStandardMaterial color="#332B24" roughness={1} /></mesh>
      <mesh position={[0, 1.5, 0]} castShadow><cylinderGeometry args={[0.07, 0.12, 2.2, 10]} /><Surface id="walnut" /></mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.p} castShadow><icosahedronGeometry args={[l.s, 2]} /><meshStandardMaterial color="#AAB7A1" roughness={0.9} /></mesh>
      ))}
    </group>
  );
}

export function Bench({ position = [0, 0, 0], length = 2.6, rotationY = 0 }: P & { length?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <RoundedBox args={[length, 0.08, 0.5]} radius={0.015} position={[0, 0.46, 0]} castShadow receiveShadow><Surface id="oak" repeat={[1, 0.3]} /></RoundedBox>
      {[-length / 2 + 0.25, length / 2 - 0.25].map((x) => (
        <mesh key={x} position={[x, 0.21, 0]} castShadow><boxGeometry args={[0.07, 0.42, 0.4]} /><Surface id="bronze" metalness={1} roughness={0.35} /></mesh>
      ))}
    </group>
  );
}

export function ReededPartition({ position = [0, 0, 0], rotationY = 0, width = 3, height = 2.7 }: P & { width?: number; height?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, height / 2, 0]}><boxGeometry args={[width, height, 0.03]} />
        <meshPhysicalMaterial color="#E9F0EA" roughness={0.18} transmission={0} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, height / 2, 0.02]}><planeGeometry args={[width, height]} /><Surface id="glass" repeat={[width / 1.4, 1]} roughness={0.15} /></mesh>
      {[-width / 2, width / 2].map((x) => <mesh key={x} position={[x, height / 2, 0]}><boxGeometry args={[0.04, height, 0.06]} /><Surface id="bronze" metalness={1} /></mesh>)}
      <mesh position={[0, height, 0]}><boxGeometry args={[width, 0.04, 0.06]} /><Surface id="bronze" metalness={1} /></mesh>
    </group>
  );
}

export function Cushion({ position, rotation = [0, 0, 0] as Vec3, size = [0.55, 0.5, 0.18] as Vec3, material = "boucle" as MaterialId, tint = "#F5F1E9" }: { position: Vec3; rotation?: Vec3; size?: Vec3; material?: MaterialId; tint?: string }) {
  return <RoundedBox args={size} radius={0.07} smoothness={4} position={position} rotation={rotation} castShadow><Surface id={material} repeat={[0.8, 0.8]} tint={tint} roughness={1} /></RoundedBox>;
}
