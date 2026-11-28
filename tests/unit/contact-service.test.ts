import { describe, expect, it, vi } from "vitest";
import { buildMessage, oneLine } from "@/server/contact/message";
import { createResendMailer, type Mailer } from "@/server/contact/adapters";
import { DEFAULT_RULES, handleContactRequest, MAX_BODY_BYTES, type ContactDeps } from "@/server/contact/service";
import { createMemoryRateLimiter } from "@/server/security/rate-limit";
import { silentLogger } from "@/server/logger";

const ORIGIN = "https://www.studio.com";
const valid = { kind: "inquiry", name: "Ayesha Rahman", email: "ayesha@example.org", type: "Residential", message: "We would like to talk about a villa." };

function setup(over: Partial<ContactDeps> = {}) {
  const send = vi.fn(async (msg: Parameters<Mailer["send"]>[0]) => { void msg; });
  const mailer: Mailer = { send };
  const deps: ContactDeps = {
    brandName: "Atelier Verre", destination: "studio@studio.com", from: "Studio <hello@studio.com>", mailer,
    origin: { allowed: new Set([ORIGIN]), requireOrigin: true }, proxy: { header: undefined, hops: 1 },
    limiter: createMemoryRateLimiter(), logger: silentLogger, ...over,
  };
  return { deps, send };
}
const post = (body: unknown, headers: Record<string, string> = {}, raw?: string) =>
  new Request("http://localhost/api/contact", { method: "POST", headers: { "content-type": "application/json", origin: ORIGIN, ...headers }, body: raw ?? JSON.stringify(body) });
const json = async (r: Response) => r.json() as Promise<Record<string, unknown>>;

describe("handleContactRequest", () => {
  it("delivers a valid inquiry and responds with no-store", async () => {
    const { deps, send } = setup();
    const res = await handleContactRequest(post(valid), deps);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await json(res)).toEqual({ ok: true, delivered: true });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0]).toMatchObject({ to: "studio@studio.com", from: "Studio <hello@studio.com>", replyTo: "ayesha@example.org" });
  });

  it("accepts a newsletter signup (email only)", async () => {
    const { deps, send } = setup();
    expect((await handleContactRequest(post({ kind: "newsletter", email: "a@b.co" }), deps)).status).toBe(200);
    expect(send).toHaveBeenCalledOnce();
  });

  it("rejects foreign and missing origins (CSRF) before doing any work", async () => {
    const { deps, send } = setup();
    const evil = await handleContactRequest(post(valid, { origin: "https://evil.example" }), deps);
    expect(evil.status).toBe(403);
    expect(await json(evil)).toMatchObject({ ok: false, code: "invalid_origin" });
    const none = new Request("http://localhost/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(valid) });
    expect((await handleContactRequest(none, deps)).status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects text/plain bodies (cross-site simple requests)", async () => {
    const { deps } = setup();
    const res = await handleContactRequest(post(valid, { "content-type": "text/plain" }), deps);
    expect(res.status).toBe(415);
  });

  it("rejects oversized bodies (the 3 MB probe from the audit)", async () => {
    const { deps, send } = setup();
    const huge = JSON.stringify({ email: "a@b.co", message: "x".repeat(3_000_000) });
    const res = await handleContactRequest(post(null, {}, huge), deps);
    expect(res.status).toBe(413);
    expect(MAX_BODY_BYTES).toBeLessThanOrEqual(16 * 1024);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON and invalid fields with generic messages", async () => {
    const { deps } = setup();
    expect((await handleContactRequest(post(null, {}, "{nope"), deps)).status).toBe(400);
    const bad = await handleContactRequest(post({ ...valid, email: "not-an-email" }), deps);
    expect(bad.status).toBe(422);
    expect(await json(bad)).toMatchObject({ code: "validation_failed" });
    expect((await handleContactRequest(post({ ...valid, extra: "field" }), deps)).status).toBe(422); // strict schema
  });

  it("answers honeypot submissions with a fake success and sends nothing (bots learn nothing)", async () => {
    const { deps, send } = setup();
    const res = await handleContactRequest(post({ ...valid, company: "SpamCo" }), deps);
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ ok: true, delivered: true });
    expect(send).not.toHaveBeenCalled();
  });

  it("rate-limits repeated submissions from the same address with a Retry-After header", async () => {
    const { deps } = setup();
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) statuses.push((await handleContactRequest(post(valid), deps)).status);
    expect(statuses).toEqual([200, 200, 200, 429]);
    const res = await handleContactRequest(post(valid), deps);
    expect(Number(res.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await json(res)).toMatchObject({ code: "rate_limited" });
  });

  it("is NOT bypassed by spoofing X-Forwarded-For when no trusted proxy is configured", async () => {
    const { deps } = setup();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await handleContactRequest(post(valid, { "x-forwarded-for": `10.9.8.${i}` }), deps)).status);
    expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0);
  });

  it("does not let a handful of requests lock out every visitor (the shared-bucket DoS from the audit)", async () => {
    const { deps } = setup();
    for (let i = 0; i < 10; i++) await handleContactRequest(post({ kind: "newsletter", email: `bot${i}@example.org` }), deps);
    const legit = await handleContactRequest(post({ kind: "newsletter", email: "real.visitor@example.org" }), deps);
    expect(legit.status).toBe(200);
  });

  it("applies per-IP limits using the trusted proxy header, ignoring spoofed left-hand entries", async () => {
    const { deps } = setup({ proxy: { header: "x-forwarded-for", hops: 1 }, rules: { ...DEFAULT_RULES, ip: { limit: 2, windowMs: 60_000 } } });
    const attempt = (n: number) => handleContactRequest(post({ kind: "newsletter", email: `u${n}@example.org` }, { "x-forwarded-for": `1.1.1.${n}, 203.0.113.9` }), deps);
    expect([(await attempt(1)).status, (await attempt(2)).status, (await attempt(3)).status]).toEqual([200, 200, 429]);
  });

  it("reports delivered:false (not an error) when no mail provider is configured, and never claims delivery", async () => {
    const { deps } = setup({ mailer: undefined, from: undefined });
    const res = await handleContactRequest(post(valid), deps);
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ ok: true, delivered: false });
  });

  it("persists the lead before sending, and still responds if the store fails", async () => {
    const save = vi.fn(async () => { throw new Error("db down"); });
    const { deps, send } = setup({ store: { save } });
    const res = await handleContactRequest(post(valid), deps);
    expect(save).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledOnce();
    expect(res.status).toBe(200);
  });

  it("returns a generic 502 without leaking provider details when delivery fails", async () => {
    const { deps } = setup({ mailer: { send: async () => { throw new Error("401 invalid API key re_secret"); } } });
    const res = await handleContactRequest(post(valid), deps);
    expect(res.status).toBe(502);
    const body = JSON.stringify(await json(res));
    expect(body).not.toMatch(/re_secret|401|invalid API key/);
  });
});

describe("message building", () => {
  it("strips CR/LF and control characters so input cannot inject mail headers", () => {
    expect(oneLine("Residential\r\nBcc: attacker@evil.example")).toBe("Residential Bcc: attacker@evil.example");
    const m = buildMessage({ kind: "inquiry", email: "a@b.co", type: "Villa\r\nBcc: x@y.z", name: "Name\nInjected: yes" }, "Atelier Verre");
    expect(m.subject).not.toMatch(/[\r\n]/);
    expect(m.text.split("\n").filter((l) => l.startsWith("Injected:"))).toHaveLength(0);
  });
});

describe("Resend mailer adapter", () => {
  it("posts to the provider with a bearer token and a timeout signal, and throws on failure", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    await createResendMailer("re_key", fetchImpl as unknown as typeof fetch).send({ to: "a@b.co", from: "x <y@z.co>", subject: "s", text: "t", replyTo: "r@s.co" });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_key");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    const failing = vi.fn(async () => new Response("no", { status: 500 }));
    await expect(createResendMailer("k", failing as unknown as typeof fetch).send({ to: "a@b.co", from: "f", subject: "s", text: "t", replyTo: "r@s.co" })).rejects.toThrow(/500/);
  });
});
