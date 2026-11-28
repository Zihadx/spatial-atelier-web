import { expect, test } from "@playwright/test";
import { ready, watch } from "./helpers";

test.describe("cinematic hero", () => {
  test("loads the sequence progressively and keeps the canvas painted while scrubbing", async ({ page, isMobile }) => {
    const frameRequests: string[] = [];
    page.on("request", (r) => { if (r.url().includes("/hero/sequence/")) frameRequests.push(r.url()); });
    const w = await watch(page);
    await page.goto("/");
    await ready(page);
    await expect(page.locator("#hero")).toHaveAttribute("data-seq", "ready", { timeout: 30_000 });
    // not everything up-front: a tiny fraction of the full set loads before any scrolling
    expect(frameRequests.length).toBeLessThan(isMobile ? 60 : 80);
    expect(frameRequests.every((u) => /\?v=[0-9a-f]{10}$/.test(u) || !u.includes("/f-"))).toBe(true);
    const painted = await page.evaluate(() => { const c = document.querySelector<HTMLCanvasElement>("#hero canvas")!; const d = c.getContext("2d")!.getImageData(c.width / 2, c.height / 2, 1, 1).data; return d[3] > 0; });
    expect(painted).toBe(true);
    await page.evaluate(() => window.scrollTo(0, document.getElementById("hero")!.offsetHeight * 0.5));
    await page.waitForTimeout(1500);
    await expect(page.locator("#hero [data-end], #hero [data-mid]").first()).toBeAttached();
    expect(w.issues).toEqual([]);
  });

  test("reduced motion: one static screen, no frame loading", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const frames: string[] = [];
    page.on("request", (r) => { if (/\/f-\d+\.webp\?v=/.test(r.url())) frames.push(r.url()); });
    await page.goto(`${baseURL}/`);
    await page.waitForTimeout(2500);
    const h = await page.locator("#hero").evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThanOrEqual(810);
    await expect(page.locator("#hero")).toHaveAttribute("data-seq", "static");
    expect(frames).toEqual([]);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Spaces That");
    await ctx.close();
  });
});

test.describe("design process 3D stage", () => {
  test("arms only near the section, then plays and reaches each stage", async ({ page }) => {
    const processFrames: string[] = [];
    page.on("request", (r) => { if (r.url().includes("/process/sequence/")) processFrames.push(r.url()); });
    await page.goto("/");
    await ready(page);
    await page.waitForTimeout(1500);
    expect(processFrames.length).toBe(0); // nothing fetched until the section is near

    const geo = await page.evaluate(() => { const s = document.querySelector('section[aria-labelledby="proc-title"]')!; const r = s.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
    for (let y = 0; y < geo.top; y += Math.max(500, geo.top / 12)) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(40); }
    const section = page.locator('section[aria-labelledby="proc-title"]');
    await page.evaluate((t) => window.scrollTo(0, t + 20), geo.top);
    await expect(section).toHaveAttribute("data-seq", "ready", { timeout: 30_000 });

    for (const [p, stage] of [[0.5, "04"], [0.97, "07"]] as const) {
      await page.evaluate(([t, h, q]) => window.scrollTo(0, t + q * (h - innerHeight)), [geo.top, geo.h, p] as const);
      await page.waitForTimeout(1500);
      await expect(section.locator('[data-pcopy] .num').first()).toContainText(stage);
    }
    const painted = await section.locator("canvas").evaluate((c: HTMLCanvasElement) => c.getContext("2d")!.getImageData(c.width / 2, c.height / 2, 1, 1).data[3] > 0);
    expect(painted).toBe(true);
    await expect(section.locator("[data-pcall]").first()).toBeAttached();
  });
});

test.describe("selected work rail (mobile)", () => {
  test("is a horizontal snap rail with a peeking next card, and the page never scrolls sideways", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile-only layout");
    await page.goto("/");
    await ready(page);
    const section = page.locator('section[aria-labelledby="featured-title"]');
    await section.scrollIntoViewIfNeeded();
    const rail = section.locator("ul").first();
    const info = await rail.evaluate((ul) => ({ overflowX: getComputedStyle(ul).overflowX, scrollable: ul.scrollWidth > ul.clientWidth, card0Right: ul.children[0].getBoundingClientRect().right, next: ul.children[1].getBoundingClientRect().left, vw: innerWidth }));
    expect(info.overflowX).toBe("auto");
    expect(info.scrollable).toBe(true);
    expect(info.next).toBeLessThan(info.vw - 20);     // the next card peeks in
    expect(info.next).toBeGreaterThan(info.card0Right); // …and does not overlap the first
    await rail.evaluate((ul) => ul.scrollBy({ left: ul.children[0].getBoundingClientRect().width + 16, behavior: "instant" }));
    await page.waitForTimeout(700);
    await expect(section.getByText(/02 \/ 05/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});
