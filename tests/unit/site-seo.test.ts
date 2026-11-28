import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SITE = "https://www.studio.com";
beforeEach(() => { vi.resetModules(); vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE); });
afterEach(() => { vi.unstubAllEnvs(); vi.doUnmock("@/config/contact.config"); vi.doUnmock("@/config/locations.config"); });

describe("site accessors", () => {
  it("builds absolute URLs from the validated site URL", async () => {
    const s = await import("@/lib/site");
    expect(s.getSiteUrl()).toBe(SITE);
    expect(s.absoluteUrl("/projects")).toBe(`${SITE}/projects`);
    expect(s.absoluteUrl("/")).toBe(SITE);
    expect(s.absoluteUrl("journal")).toBe(`${SITE}/journal`);
  });

  it("falls back to localhost outside production when no URL is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const s = await import("@/lib/site");
    expect(s.getSiteUrl()).toBe("http://localhost:3000");
  });

  it("sends contact messages to CONTACT_TO_EMAIL, else the configured primary email", async () => {
    let s = await import("@/lib/site");
    expect(s.getContactDestination()).toBe("nzihad.io@gmail.com");
    vi.resetModules(); vi.stubEnv("CONTACT_TO_EMAIL", "inbox@studio.com");
    s = await import("@/lib/site");
    expect(s.getContactDestination()).toBe("inbox@studio.com");
  });

  it("exposes a launch checklist of every mock item", async () => {
    const inv = (await import("@/lib/site")).getMockInventory();
    expect(inv.some((l) => l.includes("Gulshan Studio"))).toBe(true);
    expect(inv.some((l) => l.includes("Dhanmondi Showroom"))).toBe(true);
    expect(inv.some((l) => l.includes("email and phone"))).toBe(true);
  });
});

describe("metadata", () => {
  it("gives every page its own title, canonical, og:url and twitter tags (the shared-home-title bug)", async () => {
    const { buildMetadata } = await import("@/lib/seo");
    const m = buildMetadata({ title: "Projects", description: "All projects.", path: "/projects" });
    expect(m.title).toBe("Projects");
    expect(m.alternates?.canonical).toBe(`${SITE}/projects`);
    expect(m.openGraph).toMatchObject({ title: "Projects — Atelier Verre", url: `${SITE}/projects`, siteName: "Atelier Verre" });
    expect(m.twitter).toMatchObject({ card: "summary_large_image", title: "Projects — Atelier Verre" });
  });
  it("supports absolute titles and noindex", async () => {
    const { buildMetadata } = await import("@/lib/seo");
    const m = buildMetadata({ title: "Home title", absoluteTitle: true, description: "d", path: "/", noindex: true });
    expect(m.title).toEqual({ absolute: "Home title" });
    expect(m.robots).toEqual({ index: false, follow: false });
  });
});

describe("structured data", () => {
  it("escapes sequences that could break out of a <script> tag", async () => {
    const { serializeJsonLd } = await import("@/lib/seo");
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>", amp: "a&b", sep: "x\u2028y" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
    expect(out).not.toContain("\u2028");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>"); // still round-trips
  });

  it("never publishes mock contact details or mock locations", async () => {
    const { buildSiteJsonLd } = await import("@/lib/seo");
    const graph = buildSiteJsonLd()["@graph"] as Record<string, unknown>[];
    const org = graph.find((n) => n["@type"] === "Organization")!;
    expect(org.email).toBeUndefined();
    expect(org.contactPoint).toBeUndefined();
    expect(graph.some((n) => n["@type"] === "LocalBusiness")).toBe(false);
    expect(JSON.stringify(graph)).not.toMatch(/nzihad|8801304610108|Gulshan|Dhanmondi/);
  });

  it("includes contact points and LocalBusiness entries once data is marked real", async () => {
    vi.doMock("@/config/contact.config", async () => ({ contactConfig: { ...(await vi.importActual<typeof import("@/config/contact.config")>("@/config/contact.config")).contactConfig, isMock: false } }));
    vi.doMock("@/config/locations.config", async () => ({ locationsConfig: (await vi.importActual<typeof import("@/config/locations.config")>("@/config/locations.config")).locationsConfig.map((l, i) => ({ ...l, isMock: i !== 0 })) }));
    const { buildSiteJsonLd } = await import("@/lib/seo");
    type Node = { "@type": string; contactPoint?: { telephone: string }[]; address?: Record<string, unknown> };
    const graph = buildSiteJsonLd()["@graph"] as Node[];
    expect(graph.find((n) => n["@type"] === "Organization")!.contactPoint![0].telephone).toBe("+8801304610108");
    const places = graph.filter((n) => n["@type"] === "LocalBusiness");
    expect(places).toHaveLength(1); // only the non-mock location
    expect(places[0].address).toMatchObject({ addressLocality: "Dhaka", addressCountry: "BD" });
  });
});
