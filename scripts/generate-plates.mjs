// Builds macro "material plates" (lit close-ups) from the generated texture library.
// These are texture studies derived from procedural maps — not photographs.
import sharp from "sharp";
const items = [["stone","travertine"],["stone","marble"],["wood","walnut"],["wood","oak"],["metal","bronze"],["fabric","boucle"],["fabric","linen"],["stone","stone"],["plaster","plaster"],["glass","glass"]];
const W = 1600, H = 1000;
const light = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4dc" stop-opacity="0.28"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1b1510" stop-opacity="0.5"/></linearGradient>
<radialGradient id="v" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#v)"/></svg>`);
for (const [dir, id] of items) {
  const base = await sharp(`public/textures/${dir}/${id}_albedo.jpg`).resize(1600, 1600, { kernel: "lanczos3" }).extract({ left: 0, top: 300, width: W, height: H }).toBuffer();
  await sharp(base).composite([{ input: light }]).jpeg({ quality: 84, mozjpeg: true }).toFile(`public/images/materials/${id}.jpg`);
  console.log("plate", id);
}
