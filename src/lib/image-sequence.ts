/**
 * Image-sequence engine for scroll-scrubbed footage.
 * - frames are discovered through a build-time manifest (scripts/build-hero-sequence.mjs), never hardcoded
 * - a prioritised, concurrency-limited loader fetches the poster frame first, then coarse key-frames across the
 *   whole journey, then a window around the current scroll position (biased in the scroll direction)
 * - decoded frames live in a bounded cache: key-frames + the active window are kept, everything else is released
 * - nothing here touches React: the renderer reads from the store on its own animation loop
 */

export interface SequenceSet {
  count: number;
  width: number;
  height: number;
  pad: number;
  dir: string;
}

export type SequenceStatus = "loading" | "ready" | "error";
export type DecodedFrame = ImageBitmap | HTMLImageElement;

export const frameUrl = (set: SequenceSet, index: number) => `${set.dir}/f-${String(index + 1).padStart(set.pad, "0")}.webp`;

/**
 * Horizontal focal position (CSS object-position semantics) used when the viewport crops the footage sideways.
 * Landscape screens barely crop, so they only need a gentle drift; portrait screens pan from the table to the hearth.
 * The poster's CSS (.hero-poster in globals.css) uses the same starting values and the same 6/5 breakpoint.
 */
const PAN = { landscape: { from: 0.3, to: 0.7 }, portrait: { from: 0.62, to: 0.95 } } as const;
export const panRange = (viewportAspect: number) => (viewportAspect >= 1.2 ? PAN.landscape : PAN.portrait);

/** Equivalent of CSS `object-fit: cover` with an object-position of (px, py), expressed as a canvas draw rectangle. */
export function coverRect(cw: number, ch: number, iw: number, ih: number, px: number, py: number) {
  const scale = Math.max(cw / iw, ch / ih);
  const w = iw * scale;
  const h = ih * scale;
  return { x: (cw - w) * px, y: (ch - h) * py, w, h, scale };
}

export interface FrameStoreOptions {
  /** decode width for each bitmap — keep at the on-screen need to hold memory down */
  targetWidth: number;
  concurrency: number;
  /** frames kept/preloaded ahead of and behind the playhead (in scroll direction terms) */
  ahead: number;
  behind: number;
  /** every Nth frame is a permanent key-frame so any scroll position always has something close to show */
  keyStep: number;
  onStatus?: (status: SequenceStatus, keyFraction: number) => void;
  onFrame?: (index: number) => void;
}

const MAX_ATTEMPTS = 2;

export class FrameStore {
  private frames = new Map<number, DecodedFrame>();
  private inflight = new Map<number, AbortController>();
  private attempts = new Map<number, number>();
  private dead = new Set<number>();
  private keys: number[] = [];
  private current = 0;
  private direction = 1;
  private disposed = false;
  private status: SequenceStatus = "loading";
  private retryTimer = 0;

  constructor(readonly set: SequenceSet, readonly options: FrameStoreOptions) {
    for (let i = 0; i < set.count; i += options.keyStep) this.keys.push(i);
    if (this.keys.at(-1) !== set.count - 1) this.keys.push(set.count - 1);
  }

  get targetWidth() { return this.options.targetWidth; }

  start() { this.pump(); }

  /** Tell the store where the playhead is; reprioritises loading. */
  focus(index: number) {
    const i = Math.max(0, Math.min(this.set.count - 1, Math.round(index)));
    if (i === this.current) return;
    this.direction = i > this.current ? 1 : -1;
    this.current = i;
    this.pump();
  }

  has(index: number) { return this.frames.has(index); }
  get(index: number) { return this.frames.get(index); }

  /** The exact frame if decoded, otherwise the closest decoded one (never blank once anything has loaded). */
  nearest(index: number): { frame: DecodedFrame; index: number } | null {
    const i = Math.max(0, Math.min(this.set.count - 1, Math.round(index)));
    const exact = this.frames.get(i);
    if (exact) return { frame: exact, index: i };
    for (let d = 1; d < this.set.count; d++) {
      const a = this.frames.get(i - d);
      if (a) return { frame: a, index: i - d };
      const b = this.frames.get(i + d);
      if (b) return { frame: b, index: i + d };
    }
    return null;
  }

  private priority(): number[] {
    const { count } = this.set;
    const c = this.current;
    const seen = new Set<number>();
    const out: number[] = [];
    const add = (i: number) => {
      if (i < 0 || i >= count || seen.has(i) || this.dead.has(i)) return;
      seen.add(i);
      out.push(i);
    };
    add(c);
    for (let d = 1; d <= 4; d++) add(c + this.direction * d);
    [...this.keys].sort((a, b) => Math.abs(a - c) - Math.abs(b - c)).forEach(add);
    const { ahead, behind } = this.options;
    for (let d = 1; d <= Math.max(ahead, behind); d++) {
      if (d <= ahead) add(c + this.direction * d);
      if (d <= behind) add(c - this.direction * d);
    }
    return out;
  }

  private keepSet(): Set<number> {
    const keep = new Set<number>(this.keys);
    const { ahead, behind } = this.options;
    for (let d = -behind; d <= ahead; d++) keep.add(this.current + this.direction * d);
    return keep;
  }

  private pump() {
    if (this.disposed || (typeof document !== "undefined" && document.hidden)) return;
    const keep = this.keepSet();
    // abandon requests the playhead has already left behind so they never compete with what is needed now
    this.inflight.forEach((ctrl, i) => { if (!keep.has(i)) { ctrl.abort(); this.inflight.delete(i); } });
    for (const i of this.priority()) {
      if (this.inflight.size >= this.options.concurrency) break;
      if (this.frames.has(i) || this.inflight.has(i)) continue;
      void this.load(i);
    }
  }

  private async load(i: number) {
    const ctrl = new AbortController();
    this.inflight.set(i, ctrl);
    try {
      const res = await fetch(frameUrl(this.set, i), { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const frame = await this.decode(await res.blob());
      if (this.disposed || ctrl.signal.aborted) { if ("close" in frame) frame.close(); return; }
      this.frames.set(i, frame);
      if (this.inflight.get(i) === ctrl) this.inflight.delete(i);
      this.evict();
      this.report();
      this.options.onFrame?.(i);
    } catch {
      if (this.inflight.get(i) === ctrl) this.inflight.delete(i);
      if (this.disposed || ctrl.signal.aborted) return;
      const n = (this.attempts.get(i) ?? 0) + 1;
      this.attempts.set(i, n);
      if (n >= MAX_ATTEMPTS) this.dead.add(i);
      else { window.clearTimeout(this.retryTimer); this.retryTimer = window.setTimeout(() => this.pump(), 1200); }
      this.report();
    }
    this.pump();
  }

  private async decode(blob: Blob): Promise<DecodedFrame> {
    const w = this.options.targetWidth;
    if (typeof createImageBitmap === "function") {
      try {
        return w < this.set.width ? await createImageBitmap(blob, { resizeWidth: w, resizeQuality: "high" }) : await createImageBitmap(blob);
      } catch { /* older engines: fall through to an <img> decode */ }
    }
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally { URL.revokeObjectURL(url); }
  }

  private evict() {
    const keep = this.keepSet();
    if (this.frames.size <= keep.size + 6) return;
    for (const [i, f] of this.frames) {
      if (keep.has(i)) continue;
      if ("close" in f) f.close();
      this.frames.delete(i);
    }
  }

  private report() {
    if (!this.options.onStatus) return;
    const loadedKeys = this.keys.filter((k) => this.frames.has(k)).length;
    const fraction = loadedKeys / this.keys.length;
    let next: SequenceStatus = this.status;
    if (this.frames.size === 0 && this.dead.has(0)) next = "error";
    else if (this.frames.size > 0 && fraction >= 0.5) next = "ready";
    if (next !== this.status || next === "loading") { this.status = next; this.options.onStatus(next, fraction); }
  }

  dispose() {
    this.disposed = true;
    window.clearTimeout(this.retryTimer);
    this.inflight.forEach((c) => c.abort());
    this.inflight.clear();
    this.frames.forEach((f) => { if ("close" in f) f.close(); });
    this.frames.clear();
  }
}
