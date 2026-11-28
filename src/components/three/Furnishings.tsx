"use client";
import { RoundedBox } from "@react-three/drei";
import type { Layout, LightMode, MaterialId, Vec3 } from "@/types";
import {
  Art, Bench, Chair, CoffeeTable, Cushion, CurvedSofa, FloorLamp, LongTable, Pendant, PlatformBed,
  Planter, ReededPartition, Rug, Shelving, Sideboard, LatheBase,
} from "./Furniture";
import Model, { MODELS } from "./Model";

import { Surface } from "./Surface";
import { LIGHT } from "./lighting.config";

interface Props { layout: Layout; mode: LightMode; textile: MaterialId; floor?: MaterialId }

/** Furniture composition per layout, all in the same room coordinate system (back wall z=-6, glass x=+6). */
export default function Furnishings({ layout, mode, textile }: Props) {
  const rig = LIGHT[mode];
  const glow = rig.lamp;
  const lc = rig.lampColor;

  switch (layout) {
    case "gallery":
    case "nocturne":
      return (
        <>
          <Rug position={[0.9, 0, -0.4]} radius={3} tint="#EDE4D3" />
          <CurvedSofa position={[0.9, 0, -1.2]} textile={textile} />
          <CoffeeTable position={[0.9, 0, 0.3]} />
          <Model url={MODELS.vase} height={0.46} position={[1.05, 0.52, 0.2]} />
          <Chair position={[-2.8, 0, 1.7]} look={[0.9, 0, 0.3]} />
          <Chair position={[4.1, 0, 1.9]} look={[0.9, 0, 0.3]} />
          <FloorLamp position={[-4.4, 0, -3.6]} glow={glow} color={lc} />
          <Sideboard position={[-2.6, 0, -5.6]} />
          <Art position={[2.8, 1.75, -5.82]} size={[1.5, 2]} />
        </>
      );
    case "library":
      return (
        <>
          <Shelving rows={5} />
          <Rug position={[0, 0, -0.5]} rect={[6.4, 4.6]} material="boucle" tint="#D9CBB8" />
          <CoffeeTable position={[0, 0, -0.5]} radius={0.7} top="travertine" />
          <Chair position={[-2.2, 0, -1.2]} look={[0, 0, -0.5]} height={0.88} />
          <Chair position={[2.2, 0, -1.4]} look={[0, 0, -0.5]} height={0.88} />
          <Model url={MODELS.sofa} height={0.82} position={[0, 0, -3.3]} rotationY={0} tint="#D9CBB8" />
          <FloorLamp position={[-4, 0, -3.8]} glow={glow} color={lc} />
          <FloorLamp position={[4, 0, -3.8]} glow={glow} color={lc} />
        </>
      );
    case "suite":
      return (
        <>
          <Rug position={[0, 0, -1.6]} rect={[5.2, 4.4]} material="linen" tint="#F5F1E9" />
          <PlatformBed position={[0, 0, -3.8]} />
          <Cushion position={[0, 0.55, -3]} size={[1.9, 0.14, 0.5]} material="linen" tint="#D9CBB8" />
          <RoundedBox args={[2.2, 0.4, 0.55]} radius={0.12} smoothness={4} position={[0, 0.2, -1.1]} castShadow><Surface id={textile} repeat={[0.8, 0.8]} roughness={1} /></RoundedBox>
          {[-1.9, 1.9].map((x) => (
            <group key={x} position={[x, 0, -4.9]}>
              <mesh position={[0, 0.3, 0]} castShadow receiveShadow><cylinderGeometry args={[0.28, 0.28, 0.6, 36]} /><Surface id="travertine" /></mesh>
              <Model url={MODELS.lamp} height={0.5} position={[0, 0.6, 0]} />
            </group>
          ))}
          <Chair position={[3.3, 0, -0.2]} look={[0, 0, -2]} />
          <Art position={[0, 1.7, -5.82]} size={[2.6, 1.1]} />
        </>
      );
    case "office":
      return (
        <>
          <LongTable position={[0, 0, -1.2]} />
          {[-2.4, -0.8, 0.8, 2.4].flatMap((x) => [
            <Chair key={`a${x}`} position={[x, 0, -2.2]} look={[x, 0, -1.2]} height={0.86} />,
            <Chair key={`b${x}`} position={[x, 0, -0.2]} look={[x, 0, -1.2]} height={0.86} />,
          ])}
          {[-2.2, 0, 2.2].map((x) => <Pendant key={x} position={[x, 3.4, -1.2]} drop={1.5} glow={glow} color={lc} radius={0.36} />)}
          <ReededPartition position={[-3.8, 0, -4.4]} width={3.4} />
          <Planter position={[3.8, 0, -4.2]} radius={0.9} />
          <Model url={MODELS.vase} height={0.5} position={[0, 0.78, -1.2]} />
        </>
      );
    case "pavilion":
      return (
        <>
          <Rug position={[-0.2, 0, -1]} rect={[5.6, 4.2]} material="linen" tint="#F5F1E9" />
          <Model url={MODELS.sofa} height={0.86} position={[0, 0, -3.2]} tint="#D9CBB8" />
          <CoffeeTable position={[0, 0, -0.9]} radius={0.62} top="stone" />
          <Chair position={[-2.8, 0, -0.8]} look={[0, 0, -0.9]} tint="#F5F1E9" />
          <Chair position={[2.8, 0, -0.8]} look={[0, 0, -0.9]} tint="#F5F1E9" />
          <FloorLamp position={[3.8, 0, -3.8]} glow={glow} color={lc} />
          <Planter position={[-4, 0, -4.2]} radius={0.8} />
        </>
      );
    case "dining":
      return (
        <>
          <Rug position={[0, 0, -0.4]} radius={3.2} tint="#EDE4D3" material="boucle" />
          <group position={[0, 0.34, -1]}>
            <LatheBase height={0.4} scale={1.35} />
            <mesh position={[0, 0.41, 0]} castShadow receiveShadow><cylinderGeometry args={[1.25, 1.25, 0.08, 72]} /><Surface id="travertine" repeat={[0.9, 0.9]} /></mesh>
          </group>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 + 0.3;
            const pos: Vec3 = [Math.sin(a) * 1.95, 0, -1 + Math.cos(a) * 1.95];
            return <Chair key={i} position={pos} look={[0, 0, -1]} height={0.84} tint={i % 2 ? "#F5F1E9" : undefined} />;
          })}
          <Pendant position={[0, 3.4, -1]} drop={1.6} glow={glow} color={lc} radius={0.5} />
          <Sideboard position={[-2.4, 0, -5.6]} />
        </>
      );
    case "court":
      return (
        <>
          <Planter position={[0, 0, -2.2]} radius={1.5} />
          <Bench position={[-3.2, 0, -0.4]} rotationY={Math.PI / 2} length={3} />
          <Bench position={[3.4, 0, -0.4]} rotationY={Math.PI / 2} length={3} />
          <Chair position={[-1.8, 0, 2.4]} look={[0, 0, -2.2]} />
          <Chair position={[1.8, 0, 2.6]} look={[0, 0, -2.2]} />
          <CoffeeTable position={[0, 0, 2.5]} radius={0.55} top="stone" />
          <FloorLamp position={[-4.6, 0, -4.4]} glow={glow} color={lc} />
        </>
      );
  }
}
