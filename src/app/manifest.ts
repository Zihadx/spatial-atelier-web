import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Atelier Verre — The Living Space", short_name: "Atelier Verre", description: "Luxury interior architecture and design.", start_url: "/", display: "standalone", background_color: "#F5F1E9", theme_color: "#332B24", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] };
}
