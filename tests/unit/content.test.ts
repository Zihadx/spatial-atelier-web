import { afterEach, describe, expect, it } from "vitest";
import { getContent, setContentSource, type ContentSource } from "@/content";
import { validateContent } from "@/content/validate";
import { createStaticContentSource } from "@/content/static";

afterEach(() => setContentSource(undefined));

describe("static content source", () => {
  it("is valid: schemas, unique slugs and every cross-reference resolve", async () => {
    expect(await validateContent(createStaticContentSource())).toEqual([]);
  });

  it("finds items by slug and returns null for unknown ones", async () => {
    const c = createStaticContentSource();
    const [first] = await c.getProjects();
    expect((await c.getProject(first.slug))?.slug).toBe(first.slug);
    expect(await c.getProject("does-not-exist")).toBeNull();
    expect(await c.getArticle("does-not-exist")).toBeNull();
  });

  it("flags every invented/illustrative item as mock", async () => {
    const studio = await createStaticContentSource().getStudio();
    expect(studio.team.every((t) => t.isMock)).toBe(true);
    expect(studio.testimonials.every((t) => t.isMock)).toBe(true);
    expect((await createStaticContentSource().getFaq()).every((f) => f.isMock)).toBe(true);
  });

  it("depicts no invented people: team entries are roles only", async () => {
    const { team } = await createStaticContentSource().getStudio();
    for (const t of team) expect(Object.keys(t).sort()).toEqual(["isMock", "note", "role", "tone"]);
  });

  it("contains no placeholder wording in production-facing copy", async () => {
    const c = createStaticContentSource();
    const all = JSON.stringify([await c.getProjects(), await c.getServices(), await c.getArticles(), await c.getStudio(), await c.getFaq(), await c.getMaterials()].map((x) => JSON.parse(JSON.stringify(x))));
    expect(all).not.toMatch(/placeholder|lorem ipsum|demonstration|replace with/i);
  });
});

describe("ContentSource seam", () => {
  it("lets any adapter replace the static source without touching callers", async () => {
    const real = createStaticContentSource();
    const fake: ContentSource = { ...real, getFaq: async () => [{ q: "From a CMS?", a: "Yes." }] };
    setContentSource(fake);
    expect(await getContent().getFaq()).toEqual([{ q: "From a CMS?", a: "Yes." }]);
  });

  it("the validator catches broken references from a bad adapter", async () => {
    const real = createStaticContentSource();
    const bad: ContentSource = { ...real, getProjects: async () => (await real.getProjects()).map((p, i) => (i === 0 ? ({ ...p, category: "nope", materials: ["unobtainium"] } as unknown as typeof p) : p)) };
    const problems = await validateContent(bad);
    expect(problems.join("\n")).toMatch(/unknown category nope/);
    expect(problems.join("\n")).toMatch(/unknown material unobtainium/);
  });
});
