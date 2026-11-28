import type { Page } from "@playwright/test";

export const PAGES = ["/", "/projects", "/services", "/studio", "/materials", "/journal", "/contact", "/privacy", "/terms"] as const;
export const ORIGIN = "http://localhost:3000";

/** Waits for the intro preloader to release the page. */
export async function ready(page: Page) {
  await page.waitForFunction(() => (window as unknown as { __avReady?: boolean }).__avReady === true, undefined, { timeout: 60_000 });
}

/** Records CSP violations and page errors from before the page's own scripts run. */
export async function watch(page: Page) {
  const issues: string[] = [];
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  page.on("pageerror", (e) => issues.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/ERR_NAME_NOT_RESOLVED|Failed to load resource.*(unsplash|net::)/i.test(m.text())) issues.push(`console: ${m.text().slice(0, 160)}`); });
  return {
    issues,
    csp: () => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp),
  };
}

/** Scrolls the whole page in steps so lazy sections mount and reveal animations settle. */
export async function scrollThrough(page: Page, step = 800) {
  await page.evaluate(async (s) => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += s) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
    window.scrollTo(0, 0);
  }, step);
  await page.waitForTimeout(800);
}
