// Procedural, tileable PBR-style texture generator (albedo + normal) for the material library.
// These are generated studio textures — NOT photographs. Run: node scripts/generate-textures.mjs
import sharp from "sharp";
import path from "node:path";

const SIZE = 1024;
let seed = 1337;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const reseed = (s) => { seed = s; };

// tileable hashed value noise: lattice wraps at integer periods (px, py) so textures tile seamlessly
function hashf(x, y, s) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2147483647)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const sm = (t) => t * t * (3 - 2 * t);
function noiseAt(seed, x, y, px, py) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = sm(x - xi), yf = sm(y - yi);
  const x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px;
  const y0 = ((yi % py) + py) % py, y1 = (y0 + 1) % py;
  const a = hashf(x0, y0, seed), b = hashf(x1, y0, seed), c = hashf(x0, y1, seed), d = hashf(x1, y1, seed);
  return a + (b - a) * xf + (c - a + (a - b - c + d) * xf) * yf;
}
const SEEDS = [117, 134, 151, 168, 185];
const N = (i, u, v, A, B) => noiseAt(SEEDS[i], u * A, v * B, A, B);
function fbm(_n, u, v, fx, fy, oct = 5) {
  let amp = 0.5, sum = 0, norm = 0;
  for (let o = 0; o < oct; o++) {
    const m = 1 << o;
    sum += amp * noiseAt(SEEDS[o % 5], u * fx * m, v * fy * m, fx * m, fy * m);
    norm += amp; amp *= 0.5;
  }
  return sum / norm;
}
const mix = (a, b, t) => a + (b - a) * t;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const hex = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
const lerpC = (c1, c2, t) => [mix(c1[0], c2[0], t), mix(c1[1], c2[1], t), mix(c1[2], c2[2], t)];

async function write(dir, name, fn) {
  const albedo = Buffer.alloc(SIZE * SIZE * 3);
  const height = new Float32Array(SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const [r, g, b, h] = fn(x / SIZE, y / SIZE);
    const i = (y * SIZE + x);
    albedo[i * 3] = clamp(r, 0, 255); albedo[i * 3 + 1] = clamp(g, 0, 255); albedo[i * 3 + 2] = clamp(b, 0, 255);
    height[i] = h;
  }
  const normal = Buffer.alloc(SIZE * SIZE * 3);
  const strength = 2.2;
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const L = height[y * SIZE + ((x - 1 + SIZE) % SIZE)], R = height[y * SIZE + ((x + 1) % SIZE)];
    const U = height[((y - 1 + SIZE) % SIZE) * SIZE + x], D = height[((y + 1) % SIZE) * SIZE + x];
    let nx = (L - R) * strength, ny = (U - D) * strength, nz = 1;
    const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const i = (y * SIZE + x) * 3;
    normal[i] = (nx * 0.5 + 0.5) * 255; normal[i + 1] = (ny * 0.5 + 0.5) * 255; normal[i + 2] = (nz * 0.5 + 0.5) * 255;
  }
  const out = path.join("public/textures", dir);
  await sharp(albedo, { raw: { width: SIZE, height: SIZE, channels: 3 } }).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(out, `${name}_albedo.jpg`));
  await sharp(normal, { raw: { width: SIZE, height: SIZE, channels: 3 } }).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(out, `${name}_normal.jpg`));
  console.log("wrote", dir, name);
}

const nz = null;

const defs = {
  travertine: ["stone", (u, v) => {
    const band = fbm(nz, u, v, 2, 14, 4);
    const fine = N(1, u, v, 8, 180);
    const t = clamp(band * 1.25 + (fine - 0.5) * 0.18);
    const base = lerpC(hex(0xcdbb9c), hex(0xe6d8bd), t);
    const pore = N(2, u, v, 64, 220); const pit = pore > 0.82 ? (pore - 0.82) * 5 : 0;
    const dark = lerpC(base, hex(0x8f7a58), clamp(pit * 1.1));
    const tone = 0.93 + 0.14 * fbm(nz, u, v, 3, 3, 3);
    return [dark[0] * tone, dark[1] * tone, dark[2] * tone, t * 0.5 - pit * 1.4];
  }],
  marble: ["stone", (u, v) => {
    const w = fbm(nz, u, v, 3, 3, 5);
    const warp = u * 4 + v * 2 + w * 3.2;
    const vein = Math.abs(Math.sin(warp * Math.PI));
    const v1 = Math.pow(1 - vein, 14);
    const w2 = fbm(nz, u + .3, v + .7, 6, 6, 4);
    const vein2 = Math.pow(1 - Math.abs(Math.sin((u * 7 - v * 5 + w2 * 2.4) * Math.PI)), 28) * 0.55;
    const base = lerpC(hex(0xf1eee8), hex(0xdcd8d0), fbm(nz, u, v, 2, 2, 4));
    const c = lerpC(base, hex(0x6f6c68), clamp(v1 * 0.7 + vein2));
    return [c[0], c[1], c[2], 0.2 - (v1 + vein2) * 0.05];
  }],
  stone: ["stone", (u, v) => {
    const m = fbm(nz, u, v, 4, 4, 6);
    const sp = N(3, u, v, 220, 220);
    const base = lerpC(hex(0x9d9486), hex(0xc4bbab), m);
    const speck = sp > 0.9 ? -38 : sp < 0.08 ? 22 : 0;
    return [base[0] + speck, base[1] + speck, base[2] + speck, m * 0.6 + (sp - 0.5) * 0.15];
  }],
  walnut: ["wood", (u, v) => grain(u, v, hex(0x3f2616), hex(0x82563a), 9, 0.5)],
  oak: ["wood", (u, v) => grain(u, v, hex(0xb78f5c), hex(0xdcc197), 7, 0.35)],
  bronze: ["metal", (u, v) => {
    const s = N(1, u, v, 2, 700) * 0.6 + N(2, u, v, 6, 300) * 0.4;
    const m = fbm(nz, u, v, 2, 2, 3);
    const c = lerpC(hex(0x7d5a36), hex(0xc2995f), clamp(s * 0.8 + m * 0.35));
    return [c[0], c[1], c[2], s * 0.25];
  }],
  boucle: ["fabric", (u, v) => {
    // loops: sum of ring-shaped bumps at random positions (wrapped)
    const cells = 128; const cu = u * cells, cv = v * cells;
    let h = 0;
    const ix = Math.floor(cu), iy = Math.floor(cv);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const gx = (ix + dx + cells) % cells, gy = (iy + dy + cells) % cells;
      const r1 = hashf(gx, gy, 1), r2 = hashf(gx, gy, 2), r3 = hashf(gx, gy, 3);
      const px = ix + dx + r1, py = iy + dy + r2;
      const d = Math.hypot(cu - px, cv - py);
      const R = 0.55 + r3 * 0.35;
      h = Math.max(h, Math.exp(-Math.pow((d - R * 0.6) / 0.22, 2)));
    }
    const tone = lerpC(hex(0xcfc4b0), hex(0xf3ede0), clamp(h * 0.9 + fbm(nz, u, v, 6, 6, 2) * 0.2));
    return [tone[0], tone[1], tone[2], h];
  }],
  linen: ["fabric", (u, v) => {
    const f = 220;
    const warp = N(1, u, v, f, 6) * 0.5 + 0.5 * Math.sin(u * f * Math.PI * 2);
    const weft = N(2, u, v, 6, f) * 0.5 + 0.5 * Math.sin(v * f * Math.PI * 2);
    const chk = ((Math.floor(u * f) + Math.floor(v * f)) & 1) ? warp : weft;
    const slub = N(3, u, v, 20, 140) > 0.78 ? 0.12 : 0;
    const t = clamp(0.45 + chk * 0.35 + slub);
    const c = lerpC(hex(0xb9a78a), hex(0xe7dcc6), t);
    return [c[0], c[1], c[2], chk * 0.6];
  }],
  plaster: ["plaster", (u, v) => {
    const m = fbm(nz, u, v, 3, 3, 6);
    const trowel = Math.sin((u * 5 + m * 6) * Math.PI) * 0.5 + 0.5;
    const c = lerpC(hex(0xd8cab4), hex(0xece2d0), clamp(m * 0.9 + trowel * 0.15));
    return [c[0], c[1], c[2], m * 0.3 + trowel * 0.12];
  }],
  glass: ["glass", (u, v) => {
    const flutes = 24;
    const f = (u * flutes) % 1;
    const prof = Math.sin(f * Math.PI);
    const c = lerpC(hex(0x6f857a), hex(0xcfe0d6), prof * 0.85 + 0.1);
    return [c[0], c[1], c[2], Math.pow(prof, 0.6) * 0.8];
  }],
};

function grain(u, v, dark, light, rings, knot) {
  // planks: growth rings run along u (horizontal), gently wavering
  const w = fbm(nz, u, v, 2, 5, 4);
  const pos = v * rings + (w - 0.5) * 1.8 + N(1, u, v, 2, 3) * 0.6;
  const r = Math.pow(Math.sin(pos * Math.PI * 2) * 0.5 + 0.5, 1.4);
  const fibre = N(2, u, v, 6, 420);
  const fine = N(4, u, v, 10, 160);
  const pores = N(3, u, v, 40, 380) > 0.9 ? 0.22 : 0;
  const t = clamp(r * 0.55 + fibre * 0.22 + fine * 0.15 + (w - 0.5) * 0.25 - pores);
  const c = lerpC(dark, light, t);
  return [c[0], c[1], c[2], t * 0.5 + fibre * 0.25 - pores];
}

const only = process.argv[2];
for (const [name, [dir, fn]] of Object.entries(defs)) {
  if (only && only !== name) continue;
  await write(dir, name, fn);
}
