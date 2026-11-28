import { describe, expect, it } from "vitest";
import { EnvError, parseEnv } from "@/env";

describe("parseEnv", () => {
  it("accepts an empty development environment with safe defaults", () => {
    const env = parseEnv({ NODE_ENV: "development" });
    expect(env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
    expect(env.ENABLE_RENDER_ROUTES).toBe(false);
    expect(env.TRUSTED_PROXY_HOPS).toBe(1);
  });

  it("requires NEXT_PUBLIC_SITE_URL in production", () => {
    expect(() => parseEnv({ NODE_ENV: "production" })).toThrow(EnvError);
    expect(() => parseEnv({ NODE_ENV: "production" })).toThrow(/NEXT_PUBLIC_SITE_URL: required/);
  });

  it("rejects insecure, placeholder and malformed site URLs in production", () => {
    expect(() => parseEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://www.studio.com" })).toThrow(/https/);
    expect(() => parseEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://example.com" })).toThrow(/placeholder/);
    expect(() => parseEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow(EnvError);
  });

  it("accepts https production URLs and localhost for local production runs", () => {
    expect(parseEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://www.studio.com" }).NEXT_PUBLIC_SITE_URL).toBe("https://www.studio.com");
    expect(() => parseEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" })).not.toThrow();
  });

  it("requires a verified sender when a mail key is set", () => {
    const base = { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://www.studio.com" };
    expect(() => parseEnv({ ...base, RESEND_API_KEY: "re_123" })).toThrow(/CONTACT_FROM_EMAIL/);
    expect(() => parseEnv({ ...base, RESEND_API_KEY: "re_123", CONTACT_FROM_EMAIL: "Studio <hello@studio.com>" })).not.toThrow();
  });

  it("validates the trusted proxy header and parses flags", () => {
    expect(() => parseEnv({ TRUSTED_PROXY_HEADER: "x-evil" })).toThrow(EnvError);
    expect(parseEnv({ TRUSTED_PROXY_HEADER: "x-forwarded-for", TRUSTED_PROXY_HOPS: "2", ENABLE_RENDER_ROUTES: "true" })).toMatchObject({ TRUSTED_PROXY_HOPS: 2, ENABLE_RENDER_ROUTES: true });
  });

  it("treats empty strings as unset (as in .env files)", () => {
    expect(parseEnv({ CONTACT_TO_EMAIL: "", RESEND_API_KEY: "" }).CONTACT_TO_EMAIL).toBeUndefined();
  });
});
