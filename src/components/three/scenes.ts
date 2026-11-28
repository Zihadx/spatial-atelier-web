"use client";
import dynamic from "next/dynamic";

// Only four canvases exist in the whole site, and each is code-split: the 3D engine downloads only when one is used.
export const SpatialCanvas = dynamic(() => import("./canvases").then((m) => m.SpatialCanvas), { ssr: false, loading: () => null });
export const MaterialCanvas = dynamic(() => import("./canvases").then((m) => m.MaterialCanvas), { ssr: false, loading: () => null });
export const ProjectViewer = dynamic(() => import("./ProjectViewer"), { ssr: false, loading: () => null });
