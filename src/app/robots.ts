import type { MetadataRoute } from "next";
import { absoluteUrl, getSite } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: getSite().seo.robots.disallow }, sitemap: absoluteUrl("/sitemap.xml") };
}
