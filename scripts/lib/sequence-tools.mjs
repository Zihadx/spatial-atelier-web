// Shared helpers for the frame-sequence build scripts.
import fs from "node:fs";

/** Finds numbered frames (name-0001.png …) in a folder, sorted, and reports gaps. */
export function discoverFrames(src) {
  if (!src || !fs.existsSync(src)) throw new Error(`source folder not found: ${src}`);
  const found = fs.readdirSync(src)
    .map((f) => { const m = f.match(/^(.*?)(\d+)\.(png|jpe?g|webp)$/i); return m ? { f, n: +m[2] } : null; })
    .filter(Boolean)
    .sort((a, b) => a.n - b.n);
  if (!found.length) throw new Error("no numbered image frames found");
  const first = found[0].n, last = found.at(-1).n;
  const gaps = [];
  for (let n = first; n <= last; n++) if (!found.some((x) => x.n === n)) gaps.push(n);
  return { found, first, last, gaps };
}

/** Average-pools an RGB(A) buffer down to w×h luminance-ish samples (used to measure frame-to-frame motion). */
export function pool(buf, width, height, channels, w = 96, h = 54) {
  const out = new Float32Array(w * h * 3);
  const bx = width / w, by = height / h;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let r = 0, g = 0, b = 0, c = 0;
    const x0 = Math.floor(x * bx), x1 = Math.floor((x + 1) * bx), y0 = Math.floor(y * by), y1 = Math.floor((y + 1) * by);
    for (let yy = y0; yy < y1; yy += 2) for (let xx = x0; xx < x1; xx += 2) { const i = (yy * width + xx) * channels; r += buf[i]; g += buf[i + 1]; b += buf[i + 2]; c++; }
    const o = (y * w + x) * 3; out[o] = r / c; out[o + 1] = g / c; out[o + 2] = b / c;
  }
  return out;
}
export const meanAbsDiff = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
