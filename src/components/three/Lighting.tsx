"use client";
import { Environment, Lightformer } from "@react-three/drei";
import type { LightMode } from "@/types";
import { LIGHT } from "./lighting";
import { useQuality } from "./quality";

/** Sun, sky/ground fill and a procedural studio environment built from lightformers (no remote HDRIs). */
export default function Lighting({ mode, windowSide = "right" }: { mode: LightMode; windowSide?: "right" | "both" | "none" }) {
  const q = useQuality();
  const r = LIGHT[mode];
  const sm = q === "high" ? 2048 : 1024;
  return (
    <>
      <hemisphereLight args={[r.hemiSky, r.hemiGround, r.hemiI]} />
      <ambientLight intensity={r.ambient} color={r.hemiSky} />
      <directionalLight
        color={r.sun}
        intensity={windowSide === "none" ? r.sunI * 0.3 : r.sunI}
        position={r.sunPos}
        castShadow={q !== "low"}
        shadow-mapSize={[sm, sm]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-radius={5}
      />
      <Environment key={mode + windowSide} resolution={256} frames={1} background={false}>
        {windowSide !== "none" && (
          <Lightformer form="rect" intensity={r.env * 5} color={r.envTint} position={[11, 2.2, 1]} rotation-y={-Math.PI / 2} scale={[16, 3.4, 1]} />
        )}
        {windowSide === "both" && (
          <Lightformer form="rect" intensity={r.env * 4} color={r.envTint} position={[-11, 2.2, 1]} rotation-y={Math.PI / 2} scale={[16, 3.4, 1]} />
        )}
        <Lightformer form="rect" intensity={r.env * 2.6} color="#FAF8F4" position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[14, 14, 1]} />
        <Lightformer form="rect" intensity={r.env * 0.9} color={r.lampColor} position={[0, 2, 12]} rotation-y={Math.PI} scale={[12, 3, 1]} />
        <Lightformer form="ring" intensity={r.env * 1.2} color={r.lampColor} position={[-4, 3, -3]} scale={4} />
      </Environment>
    </>
  );
}
