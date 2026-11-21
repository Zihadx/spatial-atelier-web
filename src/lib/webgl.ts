export type Quality = "high" | "medium" | "low";

export function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Heuristic starting quality tier; scenes can degrade at runtime via PerformanceMonitor. */
export function initialQuality(): Quality {
  if (typeof window === "undefined") return "medium";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const w = window.innerWidth;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  if ((coarse && w < 820) || mem <= 2 || cores <= 2) return "low";
  if (coarse || w < 1100 || mem <= 4 || cores <= 4) return "medium";
  return "high";
}
