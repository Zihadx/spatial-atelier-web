import { describe, expect, it } from "vitest";
import { brandConfig } from "@/config/brand.config";
import { contactConfig } from "@/config/contact.config";
import { locationsConfig } from "@/config/locations.config";
import { navigationConfig } from "@/config/navigation.config";
import { brandSchema, e164, locationSchema } from "@/config/schema";
import { siteConfig } from "@/config/site.config";

describe("site configuration", () => {
  it("keeps the wordmark in sync with the brand name", () => {
    expect(`${brandConfig.wordmark.lead} ${brandConfig.wordmark.accent}`).toBe(brandConfig.name);
    expect(() => brandSchema.parse({ ...brandConfig, wordmark: { lead: "Other", accent: "Name" } })).toThrow();
  });

  it("stores phone numbers in E.164 and rejects the malformed form", () => {
    expect(contactConfig.phones[0].e164).toBe("+8801304610108");
    expect(contactConfig.phones[0].display).toBe("+880 1304 610108");
    expect(contactConfig.whatsapp?.e164).toBe("+8801304610108");
    expect(e164.safeParse("+01304610108").success).toBe(false);
    expect(e164.safeParse("01304610108").success).toBe(false);
  });

  it("defines the two requested mock Dhaka locations, flagged as mock, with no invented street address", () => {
    expect(locationsConfig.map((l) => l.id)).toEqual(["gulshan-studio", "dhanmondi-showroom"]);
    expect(locationsConfig.map((l) => [l.type, l.area, l.city])).toEqual([["studio", "Gulshan", "Dhaka"], ["showroom", "Dhanmondi", "Dhaka"]]);
    for (const l of locationsConfig) {
      expect(l.isMock).toBe(true);
      expect(l.addressLines).toEqual([]);
      expect(l.geo).toBeUndefined();
      expect(l.timezone).toBe("Asia/Dhaka");
    }
    expect(locationsConfig.filter((l) => l.primary)).toHaveLength(1);
  });

  it("references only phones that exist", () => {
    const ids = new Set(contactConfig.phones.map((p) => p.id));
    for (const l of locationsConfig) if (l.phoneId) expect(ids.has(l.phoneId)).toBe(true);
  });

  it("validates location hours and ids", () => {
    const base = locationsConfig[0];
    expect(locationSchema.safeParse({ ...base, hours: [{ days: ["mon"], opens: "25:00", closes: "18:00" }] }).success).toBe(false);
    expect(locationSchema.safeParse({ ...base, id: "Bad Id" }).success).toBe(false);
  });

  it("marks the contact details and form options as placeholders until replaced", () => {
    expect(contactConfig.isMock).toBe(true);
    expect(contactConfig.form.isMock).toBe(true);
    expect(contactConfig.emails.primary).toBe("nzihad.io@gmail.com");
  });

  it("has internal-only navigation and a sitemap that omits internal routes", () => {
    for (const n of [...navigationConfig.main, ...navigationConfig.footerServices]) expect(n.href.startsWith("/")).toBe(true);
    expect(siteConfig.sitemapPages).toContain("/");
    expect(siteConfig.sitemapPages.some((p) => p.startsWith("/render"))).toBe(false);
    expect(siteConfig.seo.robots.disallow).toContain("/render/");
  });
});
