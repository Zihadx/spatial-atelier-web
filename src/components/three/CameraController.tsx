"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { Vec3 } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Props {
  positions: Vec3[];
  targets: Vec3[];
  /** 0..1 scroll/stage progress, read every frame (does not cause React renders) */
  progress?: MutableRefObject<number>;
  /** fixed t when no progress ref is supplied */
  t?: number;
  parallax?: number;
  sway?: number;
}

/** Cinematic rig: smooth spline through keyframes, damped, with pointer parallax. */
export default function CameraRig({ positions, targets, progress, t = 0, parallax = 0.35, sway = 0 }: Props) {
  const reduced = useReducedMotion();
  const camera = useThree((s) => s.camera);
  const pointer = useThree((s) => s.pointer);
  const pos = useMemo(() => new THREE.CatmullRomCurve3(positions.map((p) => new THREE.Vector3(...p)), false, "centripetal"), [positions]);
  const look = useMemo(() => new THREE.CatmullRomCurve3(targets.map((p) => new THREE.Vector3(...p)), false, "centripetal"), [targets]);
  const cur = useRef(progress ? progress.current : t);
  const p = useMemo(() => new THREE.Vector3(), []);
  const l = useMemo(() => new THREE.Vector3(), []);
  const lookNow = useRef(new THREE.Vector3(...targets[0]));

  useFrame((state, dt) => {
    const target = reduced ? (progress ? 0.4 : t) : progress ? progress.current : t;
    cur.current = THREE.MathUtils.damp(cur.current, target, 3.2, dt);
    pos.getPoint(THREE.MathUtils.clamp(cur.current, 0, 1), p);
    look.getPoint(THREE.MathUtils.clamp(cur.current, 0, 1), l);
    const px = reduced ? 0 : pointer.x * parallax;
    const py = reduced ? 0 : pointer.y * parallax * 0.5;
    const s = reduced ? 0 : sway;
    const time = state.clock.elapsedTime;
    camera.position.set(p.x + px + Math.sin(time * 0.25) * s, p.y + py + Math.cos(time * 0.2) * s * 0.4, p.z);
    lookNow.current.lerp(l, 1 - Math.exp(-6 * dt));
    camera.lookAt(lookNow.current);
  });
  return null;
}
