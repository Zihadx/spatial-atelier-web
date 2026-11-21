"use client";
import { MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { LightMode, MaterialId } from "@/types";
import { LIGHT } from "./lighting";
import { useQuality } from "./quality";
import { Surface, useSurfaceMaps } from "./Surface";

export const ROOM = { H: 3.4, x0: -6, x1: 6, z0: -6, z1: 10.5 } as const;
const D = ROOM.z1 - ROOM.z0;
const ZC = (ROOM.z0 + ROOM.z1) / 2;

export interface ShellProps {
  wall: MaterialId;
  floor: MaterialId;
  mode: LightMode;
  glass?: "right" | "both" | "none";
  fluted?: boolean;
  vault?: boolean;
  reflective?: boolean;
  /** hide the back wall surface (e.g. when covered by shelving) */
  sideWall?: MaterialId;
}

function skyTexture(top: string, mid: string, bot: string) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 256;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top); g.addColorStop(0.6, mid); g.addColorStop(1, bot);
  x.fillStyle = g; x.fillRect(0, 0, 1024, 256);
  const glow = x.createRadialGradient(760, 150, 4, 760, 150, 260);
  glow.addColorStop(0, "rgba(255,246,222,0.95)"); glow.addColorStop(1, "rgba(255,246,222,0)");
  x.fillStyle = glow; x.fillRect(0, 0, 1024, 256);
  let s = 11;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const layers = [["rgba(120,132,104,0.55)", 150], ["rgba(84,98,70,0.75)", 175], ["rgba(46,60,40,0.92)", 205]] as const;
  x.filter = "blur(2px)";
  for (const [col, base] of layers) {
    x.fillStyle = col; x.beginPath(); x.moveTo(0, 256);
    for (let px = 0; px <= 1024; px += 32) x.lineTo(px, base + Math.sin(px * 0.012 + base) * 14 + r() * 10);
    x.lineTo(1024, 256); x.closePath(); x.fill();
  }
  x.filter = "blur(4px)";
  for (let i = 0; i < 26; i++) {
    x.fillStyle = `rgba(34,48,30,${0.5 + r() * 0.4})`;
    x.beginPath(); x.ellipse(r() * 1024, 214 + r() * 30, 14 + r() * 26, 22 + r() * 30, 0, 0, 7); x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function shaftTexture() {
  const c = document.createElement("canvas");
  c.width = 32; c.height = 128;
  const x = c.getContext("2d")!;
  const gy = x.createLinearGradient(0, 0, 0, 128);
  gy.addColorStop(0, "rgba(255,236,200,0.9)"); gy.addColorStop(1, "rgba(255,236,200,0)");
  x.fillStyle = gy; x.fillRect(0, 0, 32, 128);
  x.globalCompositeOperation = "destination-in";
  const gx = x.createLinearGradient(0, 0, 32, 0);
  gx.addColorStop(0, "rgba(0,0,0,0)"); gx.addColorStop(0.5, "rgba(0,0,0,1)"); gx.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = gx; x.fillRect(0, 0, 32, 128);
  return new THREE.CanvasTexture(c);
}

function Floor({ id, reflective }: { id: MaterialId; reflective: boolean }) {
  const rx = id === "stone" ? 3 : 3.2, ry = id === "stone" ? 5 : 5;
  const { a, n, info } = useSurfaceMaps(id, rx, ry);
  const q = useQuality();
  const useRefl = reflective && q === "high";
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, ZC]} receiveShadow>
      <planeGeometry args={[12.2, D]} />
      {useRefl ? (
        <MeshReflectorMaterial
          map={a} normalMap={n} normalScale={new THREE.Vector2(0.5, 0.5)} color="#d8d0c4"
          resolution={512} blur={[260, 80]} mixBlur={1} mixStrength={0.55} mirror={0}
          roughness={0.55} metalness={0} depthScale={0.4} minDepthThreshold={0.5} maxDepthThreshold={1.6}
        />
      ) : (
        <meshStandardMaterial map={a} normalMap={n} normalScale={new THREE.Vector2(0.5, 0.5)} roughness={info.roughness * 0.8} />
      )}
    </mesh>
  );
}

function FlutedWall({ id }: { id: MaterialId }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = 58;
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    const d = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      d.position.set(-5.85 + i * 0.205, ROOM.H / 2, ROOM.z0 + 0.1);
      d.updateMatrix(); m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow receiveShadow>
      <cylinderGeometry args={[0.1, 0.1, ROOM.H - 0.04, 18]} />
      <Surface id={id} repeat={[0.5, 1.6]} tint="#f4ecde" normalScale={0.4} />
    </instancedMesh>
  );
}

function Vault({ ceiling }: { ceiling: boolean }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(12, D, 64, 1);
    g.rotateX(Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setY(i, ROOM.H - 0.2 + 1.5 * (1 - (x / 6) * (x / 6)));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  if (!ceiling) return null;
  return <mesh geometry={geo} position={[0, 0, ZC]} receiveShadow><Surface id="plaster" repeat={[2, 3]} side={THREE.DoubleSide} /></mesh>;
}

export default function RoomShell({ wall, floor, mode, glass = "right", fluted = false, vault = false, reflective = false, sideWall }: ShellProps) {
  const q = useQuality();
  const rig = LIGHT[mode];
  const sky = useMemo(() => skyTexture(rig.skyTop, rig.skyMid, rig.skyBot), [rig]);
  const shaft = useMemo(() => shaftTexture(), []);
  const H = ROOM.H;
  const mullions = useMemo(() => Array.from({ length: 7 }, (_, i) => ROOM.z0 + 0.1 + i * 2.45), []);
  const sw = sideWall ?? wall;
  const rightGlass = glass !== "none";

  const basis = useMemo(() => {
    const d = new THREE.Vector3(-6, -2.79, -1.7).normalize();
    const up = d.clone().negate();
    const xA = new THREE.Vector3(0, 0, 1);
    const zA = new THREE.Vector3().crossVectors(xA, up).normalize();
    const m = new THREE.Matrix4().makeBasis(xA, up, zA);
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }, []);

  return (
    <group>
      <Floor id={floor} reflective={reflective} />
      {/* back wall */}
      <mesh position={[0, H / 2, ROOM.z0]} receiveShadow castShadow>
        <boxGeometry args={[12.2, H, 0.2]} /><Surface id={wall} repeat={[3, 1.6]} />
      </mesh>
      {fluted && <FlutedWall id={wall} />}
      {/* front wall */}
      <mesh position={[0, H / 2, ROOM.z1]} receiveShadow><boxGeometry args={[12.2, H, 0.2]} /><Surface id="plaster" repeat={[3, 1]} /></mesh>
      {/* left wall or glass */}
      {glass === "both" ? <GlassWall x={ROOM.x0} mullions={mullions} /> : (
        <mesh position={[ROOM.x0, H / 2, ZC]} receiveShadow castShadow><boxGeometry args={[0.2, H, D]} /><Surface id={sw} repeat={[5, 1.6]} /></mesh>
      )}
      {/* ceiling */}
      <mesh position={[0, H + 0.1, ZC]} receiveShadow><boxGeometry args={[12.2, 0.2, D]} /><meshStandardMaterial color="#F5F1E9" emissive="#EADFCB" emissiveIntensity={rig.ceil} roughness={1} /></mesh>
      <Vault ceiling={vault} />
      {/* right glass wall */}
      {rightGlass && <GlassWall x={ROOM.x1} mullions={mullions} />}
      {!rightGlass && (
        <mesh position={[ROOM.x1, H / 2, ZC]} receiveShadow castShadow><boxGeometry args={[0.2, H, D]} /><Surface id={sw} repeat={[5, 1.6]} /></mesh>
      )}
      {/* exterior sky */}
      {rightGlass && (
        <mesh position={[16, H / 2, ZC]} rotation-y={-Math.PI / 2}><planeGeometry args={[70, 17.5]} /><meshBasicMaterial map={sky} toneMapped={false} fog={false} /></mesh>
      )}
      {glass === "both" && (
        <mesh position={[-16, H / 2, ZC]} rotation-y={Math.PI / 2}><planeGeometry args={[70, 17.5]} /><meshBasicMaterial map={sky} toneMapped={false} fog={false} /></mesh>
      )}
      {/* cove light strip */}
      <mesh position={[0, H - 0.03, ROOM.z0 + 0.15]}><boxGeometry args={[11, 0.03, 0.14]} /><meshBasicMaterial color={rig.lampColor} toneMapped={false} /></mesh>
      {/* sun shafts */}
      {rightGlass && q !== "low" && mullions.slice(0, 6).map((z, i) => (
        <mesh key={i} position={[3, 1.4, z + 1.2 + 0.85]} quaternion={basis} renderOrder={5}>
          <planeGeometry args={[1.1, 6.6]} />
          <meshBasicMaterial map={shaft} transparent opacity={mode === "dusk" ? 0.05 : 0.09} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
      {q === "high" && rightGlass && <Sparkles count={46} scale={[7, 3, 10]} position={[1, 1.7, 2]} size={2.2} speed={0.15} opacity={0.5} color="#FFE2B0" />}
    </group>
  );
}

function GlassWall({ x, mullions }: { x: number; mullions: number[] }) {
  const H = ROOM.H;
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, H / 2, ZC]}><boxGeometry args={[0.02, H, D]} /><meshPhysicalMaterial color="#F5F1E9" roughness={0.04} transparent opacity={0.07} envMapIntensity={1.4} /></mesh>
      {mullions.map((z) => (
        <mesh key={z} position={[0, H / 2, z]} castShadow><boxGeometry args={[0.1, H, 0.14]} /><Surface id="bronze" tint="#8a6d48" roughness={0.5} metalness={0.75} /></mesh>
      ))}
      <mesh position={[0, H - 0.05, ZC]} castShadow><boxGeometry args={[0.12, 0.1, D]} /><Surface id="bronze" tint="#8a6d48" roughness={0.5} metalness={0.75} /></mesh>
      <mesh position={[0, 0.05, ZC]}><boxGeometry args={[0.12, 0.1, D]} /><Surface id="bronze" tint="#8a6d48" roughness={0.5} metalness={0.75} /></mesh>
    </group>
  );
}
