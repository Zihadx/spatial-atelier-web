import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { coverRect, FrameStore, frameUrl, panRange, progressToFrame, type SequenceSet } from "@/lib/image-sequence";

const set = (over: Partial<SequenceSet> = {}): SequenceSet => ({ count: 11, width: 1600, height: 900, pad: 4, dir: "/seq/lg", ...over });

describe("frame URLs", () => {
  it("zero-pads, and appends the content hash only when asked", () => {
    expect(frameUrl(set(), 0)).toBe("/seq/lg/f-0001.webp");
    expect(frameUrl(set({ version: "abc123" }), 9)).toBe("/seq/lg/f-0010.webp?v=abc123");
    expect(frameUrl(set({ version: "abc123" }), 9, { versioned: false })).toBe("/seq/lg/f-0010.webp");
  });
});

describe("progressToFrame", () => {
  it("is linear without a curve and clamps out-of-range progress", () => {
    expect(progressToFrame(set(), 0)).toBe(0);
    expect(progressToFrame(set(), 0.5)).toBe(5);
    expect(progressToFrame(set(), 2)).toBe(10);
    expect(progressToFrame(set(), -1)).toBe(0);
  });
  it("follows the motion curve so visible progress, not frame count, tracks scroll", () => {
    // 5 frames, almost all motion between frames 2 and 3
    const s = set({ count: 5, curve: [0, 0.05, 0.1, 0.9, 1] });
    expect(progressToFrame(s, 0.1)).toBeCloseTo(2, 5);
    expect(progressToFrame(s, 0.5)).toBeCloseTo(2.5, 5);
    expect(progressToFrame(s, 0.9)).toBeCloseTo(3, 5);
    expect(progressToFrame(s, 1)).toBe(4);
  });
  it("ignores a curve whose length does not match the frame count", () => {
    expect(progressToFrame(set({ count: 5, curve: [0, 1] }), 0.5)).toBe(2);
  });
});

describe("cover geometry", () => {
  it("fills the box without distortion and honours the focal point", () => {
    const wide = coverRect(1000, 1000, 1600, 900, 0, 0.5);
    expect(wide.h).toBe(1000);
    expect(wide.w / wide.h).toBeCloseTo(1600 / 900, 5);
    expect(wide.x).toBeCloseTo(0, 5);                        // focal 0 → left edge pinned
    expect(coverRect(1000, 1000, 1600, 900, 1, 0.5).x).toBeCloseTo(1000 - wide.w, 5); // focal 1 → right edge pinned
    const exact = coverRect(1600, 900, 1600, 900, 0.3, 0.5);
    expect(exact).toMatchObject({ x: 0, y: 0, w: 1600, h: 900 });
  });
  it("uses different pan ranges for landscape and portrait viewports", () => {
    expect(panRange(1.78).from).toBeLessThan(panRange(0.5).from);
  });
});

describe("FrameStore", () => {
  const bitmap = () => ({ width: 1600, height: 900, close: vi.fn() });
  let requested: string[];
  beforeEach(() => {
    requested = [];
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("document", { hidden: false });
    vi.stubGlobal("createImageBitmap", async () => bitmap());
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  const okFetch = () => vi.fn(async (url: string) => { requested.push(url); return new Response(new Blob(["x"])); });
  const opts = { targetWidth: 1600, concurrency: 1, ahead: 3, behind: 1, keyStep: 5 };

  it("loads the poster frame first, then the playhead's neighbours, then key-frames across the journey", async () => {
    vi.stubGlobal("fetch", okFetch());
    const store = new FrameStore(set({ count: 11 }), opts);
    store.start();
    await vi.waitFor(() => expect(requested.length).toBe(7));
    const idx = requested.map((u) => Number(u.match(/f-(\d+)/)![1]) - 1);
    // poster, the next few frames in scroll direction, then the key-frames (nearest first) that span the whole journey
    expect(idx).toEqual([0, 1, 2, 3, 4, 5, 10]);
    store.dispose();
  });

  it("returns the nearest decoded frame so the canvas is never blank mid-scrub", async () => {
    vi.stubGlobal("fetch", okFetch());
    const store = new FrameStore(set({ count: 11 }), opts);
    store.start();
    await vi.waitFor(() => expect(store.has(0)).toBe(true));
    expect(store.nearest(9)?.index).toBeDefined();
    expect(store.nearest(0)?.index).toBe(0);
    store.dispose();
  });

  it("keeps memory bounded: frames outside key-frames + the active window are released", async () => {
    vi.stubGlobal("fetch", okFetch());
    const count = 80;
    const store = new FrameStore(set({ count }), { ...opts, concurrency: 4, keyStep: 20 });
    store.start();
    for (const target of [0, 20, 40, 60, 79]) {
      store.focus(target);
      await vi.waitFor(() => expect(store.has(target)).toBe(true), { timeout: 2000 });
      await new Promise((r) => setTimeout(r, 20));
    }
    const loaded = Array.from({ length: count }, (_, i) => i).filter((i) => store.has(i)).length;
    expect(loaded).toBeLessThan(count / 2);
    store.dispose();
  });

  it("retries a failing frame once, then gives up on it and reports an error if nothing loads", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(async (url: string) => { requested.push(url); return new Response("nope", { status: 404 }); }));
    const statuses: string[] = [];
    const store = new FrameStore(set({ count: 3 }), { ...opts, onStatus: (s) => statuses.push(s) });
    store.start();
    await vi.advanceTimersByTimeAsync(5000);
    const zeroAttempts = requested.filter((u) => u.includes("f-0001")).length;
    expect(zeroAttempts).toBe(2);              // original + one retry, then dead
    expect(statuses).toContain("error");
    store.dispose();
  });

  it("aborts in-flight requests and closes bitmaps on dispose, without unhandled rejections", async () => {
    const rejections: unknown[] = [];
    const onRej = (e: unknown) => rejections.push(e);
    process.on("unhandledRejection", onRej);
    vi.stubGlobal("fetch", vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_res, rej) => init?.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError"))))));
    const store = new FrameStore(set({ count: 20 }), { ...opts, concurrency: 6 });
    store.start();
    store.dispose();
    await new Promise((r) => setTimeout(r, 50));
    process.off("unhandledRejection", onRej);
    expect(rejections).toEqual([]);
  });
});
