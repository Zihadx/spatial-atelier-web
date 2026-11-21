"use client";
import { useRef } from "react";
import type { RenderSpec } from "@/data/renders";
import LivingRoomScene from "./LivingRoomScene";
import SceneCanvas from "./SceneCanvas";

/** Fixed-size stage used only by scripts/render-stills.mjs to capture still renders of the 3D scenes. */
export default function RenderStage({ spec }: { spec: RenderSpec }) {
  const progress = useRef(spec.hero ?? 0);
  return (
    <div style={{ width: 1280, height: 800 }}>
      <SceneCanvas still fallback="/images/blank.jpg" alt="Render stage" fov={spec.hero !== undefined ? 38 : 40} position={spec.preset.cam.pos}>
        <LivingRoomScene
          preset={spec.preset}
          hero={spec.hero !== undefined}
          progress={progress}
          camIndex={spec.camIndex ?? 0}
          mode={spec.mode}
          wall={spec.wall}
          floor={spec.floor}
          lettering={spec.lettering}
          parallax={0}
        />
      </SceneCanvas>
    </div>
  );
}
