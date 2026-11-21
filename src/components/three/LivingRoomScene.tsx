"use client";
import { OrbitControls, Text } from "@react-three/drei";
import type { MutableRefObject } from "react";
import type { Layout, LightMode, MaterialId, ScenePreset, Vec3 } from "@/types";
import CameraRig from "./CameraController";
import Furnishings from "./Furnishings";
import Lighting from "./Lighting";
import RoomShell, { type ShellProps } from "./RoomShell";
import { LIGHT } from "./lighting";
import { variantCam } from "@/lib/camera";

export function shellFor(layout: Layout): Pick<ShellProps, "glass" | "fluted" | "vault" | "reflective"> {
  switch (layout) {
    case "gallery": return { glass: "right", fluted: true, reflective: true };
    case "nocturne": return { glass: "right", reflective: true };
    case "library": return { glass: "right", reflective: true };
    case "suite": return { glass: "none", vault: true, reflective: true };
    case "office": return { glass: "right", reflective: true };
    case "pavilion": return { glass: "both", reflective: true };
    case "dining": return { glass: "right", reflective: true };
    case "court": return { glass: "both", reflective: true };
  }
}

export interface RoomSceneProps {
  preset: ScenePreset;
  progress?: MutableRefObject<number>;
  hero?: boolean;
  camIndex?: number;
  orbit?: boolean;
  lettering?: boolean;
  mode?: LightMode;
  wall?: MaterialId;
  floor?: MaterialId;
  parallax?: number;
}

const HERO_POS: Vec3[] = [[-4.6, 2.3, 10.0], [-2.4, 1.65, 6.8], [-0.7, 1.45, 3.7]];
const HERO_LOOK: Vec3[] = [[-0.6, 1.4, -3.2], [-0.2, 1.15, -2.4], [0.2, 1.0, -1.5]];

export default function LivingRoomScene({ preset, progress, hero = false, camIndex = 0, orbit = false, lettering = false, mode, wall, floor, parallax }: RoomSceneProps) {
  const m = mode ?? preset.light;
  const shell = shellFor(preset.layout);
  const cam = variantCam(preset.cam, camIndex);
  const rig = LIGHT[m];
  const light = shell.glass === "none" ? "none" : shell.glass === "both" ? "both" : "right";
  return (
    <>
      <color attach="background" args={[rig.fog]} />
      <fog attach="fog" args={[rig.fog, 18, 44]} />
      <Lighting mode={m} windowSide={light} />
      <RoomShell wall={wall ?? preset.wall} floor={floor ?? preset.floor} mode={m} {...shell} />
      <Furnishings layout={preset.layout} mode={m} textile={preset.textile} />
      {lettering && (
        <Text font="/fonts/InstrumentSerif-Regular.ttf" position={[-1.0, 2.6, -5.68]} fontSize={0.3} letterSpacing={0.3} anchorX="center" anchorY="middle" color="#60432F" material-toneMapped={false}>
          ATELIER VERRE
        </Text>
      )}
      {orbit ? (
        <OrbitControls
          target={cam.look} enablePan={false} enableZoom={false} enableDamping dampingFactor={0.06}
          minPolarAngle={Math.PI * 0.32} maxPolarAngle={Math.PI * 0.55}
          minAzimuthAngle={-0.9} maxAzimuthAngle={0.9}
          makeDefault
        />
      ) : hero ? (
        <CameraRig positions={HERO_POS} targets={HERO_LOOK} progress={progress} parallax={parallax ?? 0.4} />
      ) : (
        <CameraRig positions={[cam.pos, cam.pos]} targets={[cam.look, cam.look]} t={0} parallax={parallax ?? 0.25} sway={0.05} />
      )}
    </>
  );
}
