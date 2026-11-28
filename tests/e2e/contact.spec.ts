import { expect, test } from "@playwright/test";
import { ORIGIN } from "./helpers";

const unique = () => `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.org`;
const post = (request: import("@playwright/test").APIRequestContext, data: unknown, headers: Record<string, string> = {}) =>
  request.post("/api/contact", { data, headers: { origin: ORIGIN, ...headers } });

test.describe("contact form (UI)", () => {
  test("validates required fields, then reports honestly when delivery is not configured", async ({ page }) => {
    await page.goto("/contact");
    const form = page.getByRole("form", { name: "Project inquiry" });
    await form.getByRole("button", { name: /request a consultation/i }).click();
    await expect(form.getByRole("alert").first()).toBeVisible();
    await expect(form.locator("#email")).toHaveAttribute("aria-invalid", "true");

    await form.getByLabel("Name").fill("Test Visitor");
    await form.getByLabel("Email").fill(unique());
    await form.getByLabel("Project location").fill("Dhaka");
    await form.getByLabel("About the space").fill("A short message about a new apartment.");
    await form.getByRole("button", { name: /request a consultation/i }).click();
    // No mail provider in the test environment → the API answers delivered:false and the UI must say so (never fake success)
    await expect(page.getByText(/could not deliver your message automatically/i)).toBeVisible();
    await expect(page.getByRole("status").getByRole("link", { name: "nzihad.io@gmail.com" })).toBeVisible();
  });

  test("budget options come from config", async ({ page }) => {
    await page.goto("/contact");
    const options = await page.getByRole("form", { name: "Project inquiry" }).locator("#budget option").allTextContents();
    expect(options).toContain("Prefer to discuss");
    expect(options.some((o) => /BDT/.test(o))).toBe(true);
    expect(options.join(" ")).not.toMatch(/placeholder/i);
  });
});

test.describe("contact API (security)", () => {
  test("accepts a valid same-origin JSON request", async ({ request }) => {
    const res = await post(request, { kind: "newsletter", email: unique() });
    expect(res.status()).toBe(200);
    expect(res.headers()["cache-control"]).toBe("no-store");
    expect(await res.json()).toEqual({ ok: true, delivered: false });
  });

  test("rejects cross-origin and origin-less requests", async ({ request }) => {
    expect((await post(request, { kind: "newsletter", email: unique() }, { origin: "https://evil.example" })).status()).toBe(403);
    const noOrigin = await request.post("/api/contact", { data: { kind: "newsletter", email: unique() }, headers: { origin: "" } });
    expect(noOrigin.status()).toBe(403);
  });

  test("rejects non-JSON content types", async ({ request }) => {
    const res = await request.post("/api/contact", { data: JSON.stringify({ kind: "newsletter", email: unique() }), headers: { origin: ORIGIN, "content-type": "text/plain" } });
    expect(res.status()).toBe(415);
  });

  test("rejects an oversized body (3 MB)", async ({ request }) => {
    const res = await post(request, { email: unique(), message: "x".repeat(3_000_000) });
    expect(res.status()).toBe(413);
  });

  test("returns generic validation errors", async ({ request }) => {
    const res = await post(request, { kind: "inquiry", email: "nope" });
    expect(res.status()).toBe(422);
    expect(await res.json()).toEqual({ ok: false, error: "Please check the form and try again.", code: "validation_failed" });
  });

  test("honeypot submissions get a fake success", async ({ request }) => {
    const res = await post(request, { kind: "newsletter", email: unique(), company: "SpamCo" });
    expect(await res.json()).toEqual({ ok: true, delivered: true });
  });

  test("rate-limits one address, but spoofed X-Forwarded-For does not help and other visitors are unaffected", async ({ request }) => {
    const email = unique();
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) codes.push((await post(request, { kind: "newsletter", email }, { "x-forwarded-for": `10.9.8.${i}` })).status());
    expect(codes.slice(0, 3)).toEqual([200, 200, 200]);
    expect(codes.slice(3)).toEqual([429, 429]);
    const limited = await post(request, { kind: "newsletter", email });
    expect(Number(limited.headers()["retry-after"])).toBeGreaterThan(0);
    expect((await post(request, { kind: "newsletter", email: unique() })).status()).toBe(200);
  });

  test("only POST is served", async ({ request }) => {
    expect((await request.get("/api/contact")).status()).toBe(405);
  });
});
