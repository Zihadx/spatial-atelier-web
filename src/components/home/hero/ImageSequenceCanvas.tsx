"use client";
import { useEffect, useRef } from "react";
import { coverRect, FrameStore, panRange, progressToFrame, type SequenceSet, type SequenceStatus } from "@/lib/image-sequence";

interface Props {
  sets: { lg: SequenceSet; sm: SequenceSet };
  /** reads the 0–1 scroll progress through the hero (a plain function: no React state per frame) */
  getProgress: () => number;
  /** hands the owner a function that wakes the render loop when progress changes */
  onWake: (wake: () => void) => void;
  onStatus: (status: SequenceStatus, keyFraction: number, setKey: "lg" | "sm") => void;
  /** horizontal focal range when the box crops the footage sideways (defaults to the hero's viewport-aspect rule) */
  pan?: (viewportAspect: number) => { from: number; to: number };
  /** vertical focal position when the box crops the footage vertically */
  focalY?: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

type Nav = Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };

/**
 * Renders the frame sequence to a <canvas>. The loop only runs while something is changing (scroll easing, a new
 * frame arriving, a resize) and goes fully idle otherwise, so a still hero costs nothing.
 */
export default function ImageSequenceCanvas({ sets, getProgress, onWake, onStatus, pan: panFn = panRange, focalY = 0.55 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;
    // reduced motion: keep the static poster, never start the loader or the loop
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nav = navigator as Nav;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // desktop-class screens get the full 1920 set; phones, tablets and Save-Data get the lighter 1280 set
    const key: "lg" | "sm" = window.innerWidth >= 1100 && !coarse && !nav.connection?.saveData ? "lg" : "sm";
    const set = sets[key];
    const lowMemory = (nav.deviceMemory ?? 8) <= 4;
    const maxDpr = key === "lg" ? 2 : 1.5;
    const MAX_PIXELS = key === "lg" ? 4_200_000 : 2_400_000;

    let store: FrameStore | null = null;
    let cssW = 0, cssH = 0, scale = 1;
    let pan: { from: number; to: number } = panFn(window.innerWidth / window.innerHeight);
    let shown = 0;
    let raf = 0, last = 0, dirty = true, lastKey = "";
    let disposed = false;

    const schedule = () => { if (!raf && !disposed) raf = requestAnimationFrame(tick); };

    const buildStore = () => {
      store?.dispose();
      const targetWidth = Math.max(640, Math.min(set.width, Math.ceil(set.width * Math.min(1, scale))));
      store = new FrameStore(set, {
        targetWidth,
        concurrency: key === "lg" ? 6 : 4,
        ahead: key === "lg" ? (lowMemory ? 14 : 22) : 12,
        behind: key === "lg" ? (lowMemory ? 5 : 8) : 5,
        keyStep: key === "lg" ? 12 : 8,
        onStatus: (s, f) => onStatus(s, f, key),
        onFrame: () => { dirty = true; schedule(); },
      });
      store.focus(Math.round(shown));
      store.start();
    };

    const resize = () => {
      const r = parent.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      if (w === cssW && h === cssH) return;
      cssW = w; cssH = h;
      pan = panFn(window.innerWidth / window.innerHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr, Math.sqrt(MAX_PIXELS / (w * h)));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      scale = Math.max(canvas.width / set.width, canvas.height / set.height);
      // rebuild only when the viewport grows enough that the decoded frames would visibly soften
      if (!store) buildStore();
      else if (Math.ceil(set.width * Math.min(1, scale)) > store.targetWidth * 1.25) buildStore();
      lastKey = ""; dirty = true; schedule();
    };

    const draw = (target: number) => {
      if (!store) return;
      const w = canvas.width, h = canvas.height;
      const a = Math.floor(target);
      const f = target - a;
      const px = lerp(pan.from, pan.to, ease(Math.max(0, Math.min(1, target / (set.count - 1)))));
      const py = focalY;
      const base = store.nearest(f > 0.5 ? a + 1 : a);
      if (!base) return;
      const bitmap = base.frame;
      const iw = "naturalWidth" in bitmap ? bitmap.naturalWidth : bitmap.width;
      const ih = "naturalHeight" in bitmap ? bitmap.naturalHeight : bitmap.height;
      const r = coverRect(w, h, iw, ih, px, py);
      ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = 1;
      ctx.drawImage(bitmap, r.x, r.y, r.w, r.h);
      // sub-frame blend between the two neighbouring exact frames keeps the move fluid on the lighter set
      const other = f > 0.5 ? a : a + 1;
      const o = store.get(other);
      if (o && base.index !== other && f > 0.04 && f < 0.96) {
        ctx.globalAlpha = f > 0.5 ? 1 - f : f;
        ctx.drawImage(o, r.x, r.y, r.w, r.h);
        ctx.globalAlpha = 1;
      }
    };

    function tick(t: number) {
      raf = 0;
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
      last = t;
      const target = progressToFrame(set, getProgress());
      const diff = target - shown;
      shown = Math.abs(diff) < 0.004 ? target : shown + diff * (1 - Math.exp(-dt * 12));
      store?.focus(Math.round(shown));
      const k = `${Math.round(shown * 100)}|${canvas!.width}|${canvas!.height}`;
      if (dirty || k !== lastKey) { draw(shown); lastKey = k; dirty = false; }
      if (shown !== target || dirty) schedule(); else last = 0;
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(parent);
    resize();
    onWake(schedule);
    schedule();

    const onVisibility = () => { if (!document.hidden) { last = 0; store?.focus(Math.round(shown)); dirty = true; schedule(); } };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      onWake(() => {});
      store?.dispose();
      store = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the sequence manifest is static for the page lifetime
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
