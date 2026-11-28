import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PAGES, ready, scrollThrough } from "./helpers";

for (const path of PAGES) {
  test(`${path}: no WCAG 2 A/AA violations`, async ({ page }) => {
    await page.goto(path);
    await ready(page);
    await scrollThrough(page);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
}
