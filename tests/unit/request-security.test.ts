import { describe, expect, it } from "vitest";
import { BodyTooLargeError, isJsonRequest, isOriginAllowed, readBodyLimited, trustedClientIp } from "@/server/security/request";

const req = (body: BodyInit | null, headers: Record<string, string> = {}) => new Request("http://localhost/api/contact", { method: "POST", body, headers });

describe("readBodyLimited", () => {
  it("reads bodies within the limit", async () => {
    expect(await readBodyLimited(req("hello"), 100)).toBe("hello");
  });
  it("rejects bodies over the limit while streaming, even without a Content-Length", async () => {
    const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(60)); c.enqueue(new Uint8Array(60)); c.close(); } });
    const r = new Request("http://localhost/x", { method: "POST", body: stream, duplex: "half" } as RequestInit);
    await expect(readBodyLimited(r, 100)).rejects.toBeInstanceOf(BodyTooLargeError);
  });
  it("rejects a declared Content-Length over the limit without reading", async () => {
    await expect(readBodyLimited(req("x", { "content-length": "999999" }), 100)).rejects.toBeInstanceOf(BodyTooLargeError);
  });
});

describe("content type + origin checks", () => {
  it("only treats application/json as JSON (text/plain is the CSRF-friendly 'simple request' type)", () => {
    expect(isJsonRequest(req("{}", { "content-type": "application/json; charset=utf-8" }))).toBe(true);
    expect(isJsonRequest(req("{}", { "content-type": "text/plain" }))).toBe(false);
    expect(isJsonRequest(req("{}"))).toBe(false);
  });
  it("allows only listed origins; requires an Origin when configured to", () => {
    const policy = { allowed: new Set(["https://www.studio.com"]), requireOrigin: true };
    expect(isOriginAllowed("https://www.studio.com", policy)).toBe(true);
    expect(isOriginAllowed("https://evil.example", policy)).toBe(false);
    expect(isOriginAllowed("https://www.studio.com.evil.example", policy)).toBe(false);
    expect(isOriginAllowed(null, policy)).toBe(false);
    expect(isOriginAllowed(null, { ...policy, requireOrigin: false })).toBe(true);
  });
});

describe("trustedClientIp", () => {
  const h = (v: Record<string, string>) => new Headers(v);
  it("returns null when no trusted header is configured (never trusts a forgeable header)", () => {
    expect(trustedClientIp(h({ "x-forwarded-for": "1.2.3.4" }), undefined, 1)).toBeNull();
  });
  it("takes the Nth entry from the right of x-forwarded-for, so spoofed left-hand entries are ignored", () => {
    const headers = h({ "x-forwarded-for": "6.6.6.6, 10.9.8.7, 203.0.113.9" });
    expect(trustedClientIp(headers, "x-forwarded-for", 1)).toBe("203.0.113.9");
    expect(trustedClientIp(headers, "x-forwarded-for", 2)).toBe("10.9.8.7");
    expect(trustedClientIp(headers, "x-forwarded-for", 5)).toBeNull();
  });
  it("reads single-value headers and rejects non-IP junk", () => {
    expect(trustedClientIp(h({ "x-real-ip": "198.51.100.4" }), "x-real-ip", 1)).toBe("198.51.100.4");
    expect(trustedClientIp(h({ "x-real-ip": "not-an-ip" }), "x-real-ip", 1)).toBeNull();
    expect(trustedClientIp(h({ "x-real-ip": "2001:db8::1" }), "x-real-ip", 1)).toBe("2001:db8::1");
  });
});
