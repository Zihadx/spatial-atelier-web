import { expect, test } from "@playwright/test";
import { ORIGIN } from "./helpers";

test.describe("security headers", () => {
  test("HTML responses carry CSP, nosniff, frame, referrer, permissions and COOP headers", async ({ request }) => {
    const h = (await request.get("/")).headers();
    expect(h["content-security-policy"]).toContain("default-src 'self'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
    expect(h["content-security-policy"]).toContain("frame-ancestors 'self'");
    expect(h["content-security-policy"]).not.toContain("'unsafe-eval'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["cross-origin-opener-policy"]).toBe("same-origin");
    expect(h["x-powered-by"]).toBeUndefined();
  });

  test("frame sequences are served as immutable long-lived assets", async ({ request }) => {
    for (const url of ["/hero/sequence/lg/f-0001.webp", "/process/sequence/sm/f-0001.webp"]) {
      const res = await request.get(url);
      expect(res.status()).toBe(200);
      expect(res.headers()["cache-control"]).toContain("immutable");
    }
  });

  test("internal /render routes are not exposed in production", async ({ request }) => {
    expect((await request.get("/render/quiet-gallery-1")).status()).toBe(404);
    expect((await request.get("/render/list")).status()).toBe(404);
  });
});

test.describe("SEO", () => {
  test("robots and sitemap use the configured origin and exclude internal routes", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /render/");
    expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`<loc>${ORIGIN}/projects</loc>`);
    expect(sitemap).toMatch(/<loc>http:\/\/localhost:3000\/projects\/[a-z0-9-]+<\/loc>/);
    expect(sitemap).not.toContain("example.com");
    expect(sitemap).not.toContain("/render");
  });

  test("structured data is valid JSON, safe, and omits mock contact details and locations", async ({ page }) => {
    await page.goto("/");
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw!);
    const types = data["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toEqual(["Organization", "WebSite"]);
    expect(raw).not.toMatch(/nzihad|8801304610108|Gulshan|Dhanmondi/);
    expect(raw).not.toContain("example.com");
  });

  test("manifest comes from brand config", async ({ request }) => {
    const m = await (await request.get("/manifest.webmanifest")).json();
    expect(m.name).toContain("Atelier Verre");
    expect(m.theme_color).toBe("#332B24");
  });
});
