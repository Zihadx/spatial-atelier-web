import type { MetadataRoute } from "next";
import { JOURNAL } from "@/data/journal";
import { PROJECTS } from "@/data/projects";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/projects", "/services", "/studio", "/materials", "/journal", "/contact", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: SITE.url + p, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...PROJECTS.map((p) => ({ url: `${SITE.url}/projects/${p.slug}`, priority: 0.7 })),
    ...JOURNAL.map((a) => ({ url: `${SITE.url}/journal/${a.slug}`, priority: 0.5 })),
  ];
}
