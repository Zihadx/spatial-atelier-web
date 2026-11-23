// Builds the web-ready Design Process sequence from a folder of numbered source frames.
//   node scripts/build-process-sequence.mjs <source-dir> [--grade=sand|none]
// Writes public/process/sequence/{lg,sm}/f-0001.webp … and src/data/process-sequence.json.
//
// Two things beyond a plain resize:
//  1. --grade=sand (default): the supplied render has a saturated blush-pink backdrop that clashes with the site palette.
//     Only low-saturation pinks are shifted toward warm sand; timber, planting, glass and warm lighting are untouched
//     because their saturation is well above the mask. Use --grade=none to keep the original colours.
//  2. A motion-equalizing time curve: the footage eases in and out (about half of all visible change happens in a third
//     of the frames). The manifest stores a cumulative curve so scroll position maps to *visible* progress, which keeps
//     all seven stages feeling equally eventful instead of the first and last ones feeling frozen.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { discoverFrames, meanAbsDiff, pool } from "./lib/sequence-tools.mjs";

const src = process.argv[2];
const grade = (process.argv.find((a) => a.startsWith("--grade=")) ?? "--grade=sand").split("=")[1];
let found, first, last, gaps;
try { ({ found, first, last, gaps } = discoverFrames(src)); } catch (e) { console.error(e.message, "\nusage: node scripts/build-process-sequence.mjs <source-dir> [--grade=sand|none]"); process.exit(1); }
if (gaps.length) console.warn(`warning: ${gaps.length} missing frame number(s): ${gaps.slice(0, 12).join(", ")} — the sequence is packed`);
const meta = await sharp(path.join(src, found[0].f)).metadata();
const ratio = meta.height / meta.width;
console.log(`source: ${found.length} frames, ${meta.width}x${meta.height}, numbers ${first}–${last}, grade=${grade}`);

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function sandGrade(buf, pixels) {
  for (let i = 0; i < pixels * 3; i += 3) {
    const r = buf[i] / 255, g = buf[i + 1] / 255, b = buf[i + 2] / 255;
    const mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
    if (d < 0.02) continue;
    const s = d / mx;
    let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
    const hd = Math.abs(((h - 8 + 540) % 360) - 180);                              // distance from the pink band (≈8°)
    const m = (1 - smooth(14, 32, hd)) * (1 - smooth(0.3, 0.42, s)) * smooth(0.35, 0.55, mx);
    if (m <= 0.002) continue;
    const c = mx * s * 0.6, x = c * 0.5, m0 = mx - c;                               // target: hue 30°, 60% of the saturation
    buf[i] = Math.round((r + (c + m0 - r) * m) * 255);
    buf[i + 1] = Math.round((g + (x + m0 - g) * m) * 255);
    buf[i + 2] = Math.round((b + (m0 - b) * m) * 255);
  }
}

const sets = { lg: { width: 1600, quality: 72, step: 1 }, sm: { width: 1000, quality: 68, step: 2 } };
const manifest = { source: { frames: found.length, width: meta.width, height: meta.height, grade }, sets: {} };

for (const [key, cfg] of Object.entries(sets)) {
  const dir = path.join("public/process/sequence", key);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const picks = found.filter((_, i) => i % cfg.step === 0);
  if (picks.at(-1) !== found.at(-1)) picks.push(found.at(-1));
  const h = Math.round(cfg.width * ratio);
  let bytes = 0, prev = null;
  const weights = [0];
  for (let i = 0; i < picks.length; i++) {
    const { data, info } = await sharp(path.join(src, picks[i].f)).flatten({ background: "#E9DCCB" }).resize(cfg.width, h, { kernel: "lanczos3" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    if (grade === "sand") sandGrade(data, info.width * info.height);
    const small = pool(data, info.width, info.height, info.channels);
    if (prev) weights.push(meanAbsDiff(prev, small));
    prev = small;
    const out = path.join(dir, `f-${String(i + 1).padStart(4, "0")}.webp`);
    await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).webp({ quality: cfg.quality, effort: 5 }).toFile(out);
    bytes += fs.statSync(out).size;
  }
  // equalize visible change: compress the dynamic range of the per-frame motion, keep a floor so rests still advance
  const mean = weights.slice(1).reduce((a, b) => a + b, 0) / (weights.length - 1);
  const eq = weights.map((w, i) => (i === 0 ? 0 : Math.pow(w + 0.25 * mean, 0.7)));
  const total = eq.reduce((a, b) => a + b, 0);
  let acc = 0;
  const curve = eq.map((w) => { acc += w; return +(acc / total).toFixed(4); });
  curve[curve.length - 1] = 1;
  manifest.sets[key] = { count: picks.length, width: cfg.width, height: h, pad: 4, dir: `/process/sequence/${key}`, bytes, curve };
  console.log(`${key}: ${picks.length} frames, ${cfg.width}x${h}, ${(bytes / 1048576).toFixed(1)} MB`);
  if (key === "lg") {
    const at = (p) => curve.findIndex((c) => c >= p) + 1;
    console.log("stage boundaries (scroll 1/7 steps) → source frame:", Array.from({ length: 8 }, (_, k) => at(k / 7)).join(", "));
  }
}
fs.writeFileSync("src/data/process-sequence.json", JSON.stringify(manifest) + "\n");
console.log("wrote src/data/process-sequence.json");
