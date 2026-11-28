import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against the production build (`next build` + `next start`) so headers, caching and static output are real.
 * PW_CHROMIUM_PATH lets constrained environments supply their own Chromium; CI uses `npx playwright install chromium`.
 */
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;
const launchOptions = { executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] };

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
  webServer: { command: "node scripts/e2e-server.mjs", url: "http://localhost:3000", reuseExistingServer: !process.env.CI, timeout: 300_000, stdout: "ignore", stderr: "pipe" },
});
