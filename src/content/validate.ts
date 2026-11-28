import { z } from "zod";
import type { ContentSource } from "./source";

const text = z.string().min(1);
const service = z.object({ id: text, n: text, title: text, lead: text, body: text, scope: z.array(text).min(1), stage: z.enum(["residence", "villa", "commercial", "plan", "styling", "materials", "renovation"]), layout: z.enum(["wide", "tall", "offset"]) });
const article = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), topic: text, title: text, excerpt: text, read: text, image: text, body: z.array(text).min(1), pull: text });
const project = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/), title: text, category: text, type: text, location: text, area: text, summary: text, concept: text, spatial: text,
  details: z.array(text), materials: z.array(text).min(1), images: z.array(text).min(1), preset: z.object({ layout: text, wall: text, floor: text, accent: text, textile: text, light: text }).passthrough(),
});
const stage = z.object({ n: text, t: text, d: text, out: text });

const dupes = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);

/** Loads everything from a source and checks shapes plus cross-references. Returns a list of problems (empty = valid). */
export async function validateContent(source: ContentSource): Promise<string[]> {
  const problems: string[] = [];
  const check = (label: string, schema: z.ZodType, items: unknown[]) => items.forEach((it, i) => { const r = schema.safeParse(it); if (!r.success) problems.push(`${label}[${i}]: ${r.error.issues[0].path.join(".")} ${r.error.issues[0].message}`); });
  const [projects, categories, services, articles, materials, studio, pairings] = await Promise.all([
    source.getProjects(), source.getCategories(), source.getServices(), source.getArticles(), source.getMaterials(), source.getStudio(), source.getMaterialPairings(),
  ]);
  check("project", project, projects); check("service", service, services); check("article", article, articles); check("process", stage, studio.process);
  dupes(projects.map((p) => p.slug)).forEach((s) => problems.push(`duplicate project slug: ${s}`));
  dupes(articles.map((a) => a.slug)).forEach((s) => problems.push(`duplicate article slug: ${s}`));
  dupes(services.map((s) => s.id)).forEach((s) => problems.push(`duplicate service id: ${s}`));
  const cats = new Set(categories.map((c) => c.id)), mats = new Set(materials.map((m) => m.id));
  projects.forEach((p) => {
    if (!cats.has(p.category)) problems.push(`project ${p.slug}: unknown category ${p.category}`);
    p.materials.forEach((m) => { if (!mats.has(m)) problems.push(`project ${p.slug}: unknown material ${m}`); });
    for (const k of ["wall", "floor", "accent", "textile"] as const) if (!mats.has(p.preset[k])) problems.push(`project ${p.slug}: preset.${k} unknown material ${p.preset[k]}`);
  });
  pairings.forEach((pr) => pr.ids.forEach((m) => { if (!mats.has(m)) problems.push(`pairing "${pr.title}": unknown material ${m}`); }));
  return problems;
}
