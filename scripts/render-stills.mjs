// Captures still renders of the studio's 3D scenes via headless Chromium (SwiftShader WebGL).
// 1) npm run dev   2) node scripts/render-stills.mjs [idFilter] [baseUrl]
// Needs devDependencies: puppeteer-core, @sparticuz/chromium (or set CHROME_PATH to a local Chrome).
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const arg = process.argv[2] && process.argv[2] !== "all" ? process.argv[2] : "";
const ids = arg ? arg.split(",") : null;
const base = process.argv[3] || "http://localhost:3000";
const list = await fetch(`${base}/render/list`).then((r) => r.json());

const browser = await puppeteer.launch({
  args: [...chromium.args.filter((a) => !["--single-process", "--no-zygote"].includes(a)), "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  executablePath: process.env.CHROME_PATH || (await chromium.executablePath()),
  headless: "shell",
  protocolTimeout: 600000,
});
const page = await browser.newPage();
page.setDefaultTimeout(600000);
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
for (const r of list) {
  if (ids && !ids.includes(r.id)) continue;
  await page.goto(`${base}/render/${r.id}`, { waitUntil: "networkidle2", timeout: 900000 });
  await page.waitForFunction(() => document.body.dataset.ready === "1", { timeout: 900000 });
  await new Promise((res) => setTimeout(res, 1200));
  const dataUrl = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/png"));
  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  fs.mkdirSync(path.dirname(r.out), { recursive: true });
  await sharp(buf).resize(1920, 1200, { fit: "cover" }).jpeg({ quality: 84, mozjpeg: true }).toFile(r.out);
  console.log("rendered", r.id, "->", r.out);
}
await browser.close();
