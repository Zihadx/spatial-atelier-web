import type { ScenePreset, Vec3 } from "@/types";

/** Derive alternative camera views of a preset room: 0 = hero view, 1 = close detail, 2 = oblique. */
export function variantCam(cam: ScenePreset["cam"], i: number): { pos: Vec3; look: Vec3 } {
  const { pos, look } = cam;
  if (i === 0) return { pos, look };
  const dx = pos[0] - look[0], dz = pos[2] - look[2];
  if (i === 1) {
    const k = 0.5;
    return { pos: [look[0] + dx * k + 0.6, 1.05, look[2] + dz * k], look: [look[0] + 0.2, 0.75, look[2] + 1.4] };
  }
  const a = -0.62;
  const rx = dx * Math.cos(a) - dz * Math.sin(a);
  const rz = dx * Math.sin(a) + dz * Math.cos(a);
  return { pos: [look[0] + rx * 0.8, 1.7, look[2] + rz * 0.8], look: [look[0] - 0.4, 1.0, look[2] + 0.5] };
}
