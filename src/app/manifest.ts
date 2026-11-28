import type { MetadataRoute } from "next";
import { getBrand } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const brand = getBrand();
  return {
    name: `${brand.name} — ${brand.tagline}`, short_name: brand.name, description: "Luxury interior architecture and design.", start_url: "/", display: "standalone",
    background_color: brand.backgroundColor, theme_color: brand.themeColor, icons: [{ src: brand.logo.src, sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
