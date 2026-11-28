import { expect, test } from "@playwright/test";
import { ORIGIN, PAGES, ready, scrollThrough, watch } from "./helpers";

test.describe("every page", () => {
  for (const path of PAGES) {
    test(`${path}: renders with one h1, correct per-page SEO, and no console/CSP errors`, async ({ page }) => {
      const w = await watch(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await ready(page);
      await scrollThrough(page);

      await expect(page.locator("h1")).toHaveCount(1);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical).toBe(`${ORIGIN}${path === "/" ? "" : path}`);
      expect(await page.locator('meta[property="og:url"]').getAttribute("content")).toBe(`${ORIGIN}${path === "/" ? "" : path}`);
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
      expect(ogTitle).toContain("Atelier Verre");
      expect(await w.csp()).toEqual([]);
      expect(w.issues).toEqual([]);
    });
  }

  test("each page has its own distinct og:title", async ({ page }) => {
    const titles = new Set<string>();
    for (const path of PAGES) {
      await page.goto(path);
      titles.add((await page.locator('meta[property="og:title"]').getAttribute("content")) ?? "");
    }
    expect(titles.size).toBe(PAGES.length);
  });

  test("unknown routes return the 404 page", async ({ page }) => {
    const res = await page.goto("/definitely-not-a-page");
    expect(res?.status()).toBe(404);
  });
});

test.describe("navigation", () => {
  test("header links reach every main section", async ({ page, isMobile }) => {
    test.setTimeout(200_000); // visits seven pages, each waiting for the intro animation
    await page.goto("/");
    await ready(page);
    for (const [label, path] of [["Projects", "/projects"], ["Services", "/services"], ["Studio", "/studio"], ["Materials", "/materials"], ["Journal", "/journal"], ["Contact", "/contact"]] as const) {
      if (isMobile) {
        await page.getByRole("button", { name: /menu/i }).first().click();
        await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: new RegExp(label) }).click(); // menu items carry an index number
      } else {
        await page.getByRole("banner").getByRole("link", { name: label, exact: true }).click();
      }
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.locator("h1").first()).toBeVisible(); // let the navigation settle before leaving
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await ready(page);
    }
  });
});

test.describe("central configuration reaches the UI", () => {
  test("footer shows email, phone and WhatsApp from config, plus both locations", async ({ page }) => {
    await page.goto("/privacy");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "nzihad.io@gmail.com" })).toHaveAttribute("href", "mailto:nzihad.io@gmail.com");
    await expect(footer.getByRole("link", { name: "+880 1304 610108" })).toHaveAttribute("href", "tel:+8801304610108");
    const wa = footer.getByRole("link", { name: /WhatsApp/ });
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/8801304610108\?text=/);
    await expect(wa).toHaveAttribute("rel", /noopener/);
    await expect(footer).toContainText("Gulshan Studio");
    await expect(footer).toContainText("Dhanmondi Showroom");
    await expect(footer).not.toContainText(/demonstration|sample content/i);
  });

  test("contact page lists both locations with hours and no street address or map placeholder", async ({ page }) => {
    await page.goto("/contact");
    const main = page.locator("main");
    for (const name of ["Gulshan Studio", "Dhanmondi Showroom"]) await expect(main.getByText(name, { exact: true })).toBeVisible();
    await expect(main).toContainText("Sun – Thu · 10:00 – 18:00");
    await expect(main).toContainText("Sat – Thu · 11:00 – 19:00");
    await expect(main).toContainText("Exact address shared when you book a visit.");
    await expect(main).not.toContainText(/map placeholder|placeholder/i);
  });
});
