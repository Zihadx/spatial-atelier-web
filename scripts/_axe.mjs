import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "node:fs";
const axeSrc = fs.readFileSync("/tmp/axe/node_modules/axe-core/axe.min.js","utf8");
const browser = await puppeteer.launch({ args: [...chromium.args.filter(a=>!["--single-process","--no-zygote"].includes(a)), "--disable-webgl","--disable-3d-apis","--disable-gpu"], executablePath: await chromium.executablePath(), headless: "shell", protocolTimeout: 240000 });
let total=0;
for (const path of (process.argv[2]||"/,/contact,/projects,/services,/studio,/materials,/journal,/privacy,/terms").split(",")) {
  const page = await browser.newPage(); await page.setViewport({width:1440,height:900});
  const errs=[]; page.on("pageerror",e=>errs.push(String(e.message).slice(0,100)));
  await page.goto("http://localhost:3200"+path, { waitUntil:"load", timeout:180000 });
  await page.waitForFunction(()=>window.__avReady===true,{timeout:60000}).catch(()=>{});
  await new Promise(r=>setTimeout(r,3000));
  // scroll through so reveal animations finish and lazy content mounts
  await page.evaluate(async()=>{ const h=document.documentElement.scrollHeight; for(let y=0;y<h;y+=900){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,60)); } window.scrollTo(0,0); });
  await new Promise(r=>setTimeout(r,1500));
  await page.evaluate(axeSrc);
  const res = await page.evaluate(async()=>{ const r=await axe.run(document,{resultTypes:["violations"]}); return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(" ").slice(0,80)+" :: "+(n.any[0]?.message||n.failureSummary||"").replace(/\s+/g," ").slice(0,110))})); });
  total+=res.length;
  console.log(`\n${path}: ${res.length} violation type(s)${errs.length?` | pageerrors: ${errs.join(" ; ")}`:""}`); res.forEach(v=>{ console.log(`  [${v.impact}] ${v.id} x${v.n}`); v.ex.forEach(e=>console.log("      ",e)); });
  await page.close();
}
console.log("\nTOTAL violation types:", total);
await browser.close();
