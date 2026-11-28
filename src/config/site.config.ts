import { siteSchema } from "./schema";

export const siteConfig = siteSchema.parse({
  locale: "en_US",
  language: "en",
  seo: {
    titleTemplate: "%s — Atelier Verre",
    defaultOgImage: { src: "/images/hero/living-room.jpg", width: 1600, height: 1000, alt: "A warmly lit luxury living room with travertine, walnut and a curved bouclé sofa" },
    robots: { disallow: ["/render/"] },
  },
  projectNote: "Concept project — an illustrative design study, not delivered client work.",
  sitemapPages: ["/", "/projects", "/services", "/studio", "/materials", "/journal", "/contact", "/privacy", "/terms"],
});
