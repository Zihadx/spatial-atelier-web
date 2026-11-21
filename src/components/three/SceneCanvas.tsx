"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { detectWebGL, initialQuality, type Quality } from "@/lib/webgl";
import { QualityContext } from "./quality";
import WebGLFallback from "./WebGLFallback";

interface Props {
  children: ReactNode;
  fallback: string;
  alt: string;
  className?: string;
  fov?: number;
  position?: [number, number, number];
  /** capture mode used by the still-render route */
  still?: boolean;
  priority?: boolean;
  shadows?: boolean;
  exposure?: number;
  ariaLabel?: string;
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) onReady();
  });
  return null;
}

/**
 * Lazy, adaptive WebGL canvas. Mounts only when near the viewport, pauses when offscreen,
 * unmounts after being offscreen for a while (to respect browser WebGL context limits),
 * and always shows a static fallback image until the scene is ready or if WebGL is unavailable.
 */
export default function SceneCanvas({
  children, fallback, alt, className, fov = 38, position = [0, 1.5, 9], still = false,
  priority = false, shadows = true, exposure = 1, ariaLabel,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [quality, setQuality] = useState<Quality>("medium");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(detectWebGL());
    setQuality(still ? "low" : initialQuality());
  }, [still]);

  useEffect(() => {
    const el = host.current;
    if (!el || still) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (e.isIntersecting) { clearTimeout(t); setLive(true); }
      else t = setTimeout(() => { setLive(false); setReady(false); }, 4000);
    }, { rootMargin: "40% 0px" });
    io.observe(el);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [still]);

  const dpr: [number, number] = still ? [1, 1] : quality === "high" ? [1, 1.75] : quality === "medium" ? [1, 1.25] : [1, 1];

  return (
    <div ref={host} className={cn("relative h-full w-full overflow-hidden bg-espresso", className)} role="img" aria-label={ariaLabel ?? alt}>
      <div className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-0" : "opacity-100")}>
        <WebGLFallback src={fallback} alt={alt} priority={priority} />
      </div>
      {webgl && (live || still) && (
        <div className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>
          <QualityContext.Provider value={quality}>
            <Canvas
              shadows={shadows && quality !== "low" ? "percentage" : false}
              dpr={dpr}
              frameloop={still ? (ready ? "never" : "always") : visible ? "always" : "never"}
              camera={{ fov, position, near: 0.1, far: 80 }}
              gl={{ antialias: quality !== "low" || still, powerPreference: "high-performance", alpha: false, preserveDrawingBuffer: still }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = exposure;
              }}
            >
              <PerformanceMonitor
                onDecline={() => { if (!still) setQuality((q) => (q === "high" ? "medium" : "low")); }}
                flipflops={2}
              />
              <Suspense fallback={null}>
                {children}
                <ReadySignal
                  onReady={() => {
                    setReady(true);
                    if (still) document.body.dataset.ready = "1";
                  }}
                />
              </Suspense>
            </Canvas>
          </QualityContext.Provider>
        </div>
      )}
    </div>
  );
}
