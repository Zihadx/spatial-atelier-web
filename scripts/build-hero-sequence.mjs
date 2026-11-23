// Builds the web-ready hero frame sequence from a folder of numbered source frames.
//   node scripts/build-hero-sequence.mjs <source-dir>
// Discovers the real file names, validates the numbering, and writes:
//   public/hero/sequence/lg/f-0001.webp …   full set, 1920 px wide (desktop)
//   public/hero/sequence/sm/f-0001.webp …   every 2nd frame (+ last), 1280 px wide (phones / tablets)
//   src/data/hero-sequence.json             manifest consumed by the hero (counts, sizes, URL pattern)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const src = process.argv[2];
if (!src || !fs.existsSync(src)) { console.error("usage: node scripts/build-hero-sequence.mjs <source-dir>"); process.exit(1); }

const found = fs.readdirSync(src)
  .map((f) => { const m = f.match(/^(.*?)(\d+)\.(png|jpe?g|webp)$/i); return m ? { f, n: +m[2], pad: m[2].length } : null; })
  .filter(Boolean)
  .sort((a, b) => a.n - b.n);
if (!found.length) { console.error("no numbered image frames found"); process.exit(1); }

const first = found[0].n, last = found.at(-1).n;
const gaps = [];
for (let n = first; n <= last; n++) if (!found.some((x) => x.n === n)) gaps.push(n);
if (gaps.length) console.warn(`warning: ${gaps.length} missing frame number(s): ${gaps.slice(0, 12).join(", ")} — the sequence is packed, so playback stays continuous`);

const meta = await sharp(path.join(src, found[0].f)).metadata();
const ratio = meta.height / meta.width;
console.log(`source: ${found.length} frames, ${meta.width}x${meta.height}, numbers ${first}–${last}`);

const sets = {
  lg: { width: 1920, quality: 74, step: 1 },
  sm: { width: 1280, quality: 70, step: 2 },
};
const manifest = { source: { frames: found.length, width: meta.width, height: meta.height }, sets: {} };

for (const [key, cfg] of Object.entries(sets)) {
  const dir = path.join("public/hero/sequence", key);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const picks = found.filter((_, i) => i % cfg.step === 0);
  if (picks.at(-1) !== found.at(-1)) picks.push(found.at(-1)); // always keep the final reveal frame
  const h = Math.round(cfg.width * ratio);
  let bytes = 0;
  for (let i = 0; i < picks.length; i++) {
    const out = path.join(dir, `f-${String(i + 1).padStart(4, "0")}.webp`);
    await sharp(path.join(src, picks[i].f)).flatten({ background: "#332B24" }).resize(cfg.width, h, { kernel: "lanczos3" }).webp({ quality: cfg.quality, effort: 5 }).toFile(out);
    bytes += fs.statSync(out).size;
  }
  manifest.sets[key] = { count: picks.length, width: cfg.width, height: h, pad: 4, dir: `/hero/sequence/${key}`, bytes };
  console.log(`${key}: ${picks.length} frames, ${cfg.width}x${h}, ${(bytes / 1048576).toFixed(1)} MB`);
}
fs.writeFileSync("src/data/hero-sequence.json", JSON.stringify(manifest, null, 2) + "\n");
console.log("wrote src/data/hero-sequence.json");
