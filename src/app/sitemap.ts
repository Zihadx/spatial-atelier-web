import type { MetadataRoute } from "next";
import { getContent } from "@/content";
import { absoluteUrl, getSite } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = getContent();
  const [projects, articles] = await Promise.all([content.getProjects(), content.getArticles()]);
  return [
    ...getSite().sitemapPages.map((p) => ({ url: absoluteUrl(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...projects.map((p) => ({ url: absoluteUrl(`/projects/${p.slug}`), priority: 0.7 })),
    ...articles.map((a) => ({ url: absoluteUrl(`/journal/${a.slug}`), priority: 0.5 })),
  ];
}
