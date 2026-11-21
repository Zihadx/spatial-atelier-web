// Derives secondary images (detail crops / alternate framings) from the rendered stills, so only the key
// views need a slow software-WebGL render. Every output is still a crop of a studio 3D render.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

// [out, source, left, top, width, height] as fractions of the source image
const D = [
  ["projects/walnut-room-2", "projects/walnut-room-1", 0.35, 0.3, 0.55, 0.62],
  ["projects/walnut-room-3", "projects/walnut-room-1", 0.0, 0.1, 0.6, 0.7],
  ["projects/sand-pavilion-2", "projects/sand-pavilion-1", 0.1, 0.35, 0.55, 0.6],
  ["projects/sand-pavilion-3", "projects/sand-pavilion-1", 0.45, 0.05, 0.55, 0.7],
  ["projects/lumen-suite-2", "projects/lumen-suite-1", 0.25, 0.3, 0.5, 0.6],
  ["projects/lumen-suite-3", "projects/lumen-suite-1", 0.5, 0.0, 0.5, 0.75],
  ["projects/atrium-office-2", "projects/atrium-office-1", 0.2, 0.25, 0.55, 0.6],
  ["projects/atrium-office-3", "projects/atrium-office-1", 0.0, 0.0, 0.55, 0.7],
  ["projects/bronze-table-2", "projects/bronze-table-1", 0.25, 0.35, 0.5, 0.6],
  ["projects/bronze-table-3", "projects/bronze-table-1", 0.5, 0.05, 0.5, 0.7],
  ["projects/stone-court-residence-2", "projects/stone-court-residence-1", 0.25, 0.3, 0.55, 0.6],
  ["projects/stone-court-residence-3", "projects/stone-court-residence-1", 0.0, 0.1, 0.55, 0.7],
  ["projects/penthouse-nocturne-2", "projects/penthouse-nocturne-1", 0.25, 0.3, 0.5, 0.6],
  ["projects/penthouse-nocturne-3", "projects/penthouse-nocturne-1", 0.5, 0.0, 0.5, 0.75],
  ["projects/quiet-gallery-3", "hero/living-room", 0.0, 0.1, 0.6, 0.75],
  ["architecture/studio-intro", "projects/quiet-gallery-2", 0.2, 0.0, 0.55, 1],
  ["architecture/spatial", "hero/living-room", 0.1, 0.1, 0.8, 0.8],
  ["architecture/philosophy", "projects/sand-pavilion-1", 0.0, 0.0, 1, 1],
  ["architecture/story", "projects/walnut-room-1", 0.0, 0.0, 1, 1],
  ["architecture/services", "projects/bronze-table-1", 0.0, 0.0, 1, 1],
  ["studio/studio-1", "projects/lumen-suite-1", 0.0, 0.0, 1, 1],
  ["studio/studio-2", "projects/stone-court-residence-1", 0.0, 0.0, 1, 1],
  ["editorial/light", "hero/living-room", 0.0, 0.0, 1, 1],
  ["editorial/travertine", "projects/quiet-gallery-2", 0.0, 0.0, 0.6, 0.6],
  ["editorial/sofa", "projects/penthouse-nocturne-1", 0.2, 0.3, 0.6, 0.65],
  ["editorial/timber", "projects/walnut-room-1", 0.1, 0.1, 0.5, 0.6],
  ["editorial/spatial", "projects/sand-pavilion-1", 0.3, 0.2, 0.6, 0.7],
  ["editorial/trends", "projects/lumen-suite-1", 0.1, 0.1, 0.6, 0.7],
  ["editorial/architecture", "projects/stone-court-residence-1", 0.4, 0.1, 0.55, 0.7],
];
for (const [out, src, l, t, w, h] of D) {
  const file = `public/images/${src}.jpg`;
  if (!fs.existsSync(file)) { console.log("skip (missing source)", out); continue; }
  const m = await sharp(file).metadata();
  const box = { left: Math.round(l * m.width), top: Math.round(t * m.height), width: Math.round(w * m.width), height: Math.round(h * m.height) };
  const dest = `public/images/${out}.jpg`;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(file).extract(box).resize(1600).jpeg({ quality: 84, mozjpeg: true }).toFile(dest);
  console.log("derived", out);
}
