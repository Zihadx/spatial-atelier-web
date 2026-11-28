import { brandSchema } from "./schema";

/** Brand identity. Colours and typography live in app/globals.css (design tokens); only values needed by metadata live here. */
export const brandConfig = brandSchema.parse({
  name: "Atelier Verre",
  wordmark: { lead: "Atelier", accent: "Verre" },
  tagline: "The Living Space",
  description: "Atelier Verre is a luxury interior architecture and design studio: spaces shaped around light, stone, timber and the way you live.",
  logo: { src: "/icon.svg", alt: "Atelier Verre" },
  themeColor: "#332B24",
  backgroundColor: "#F5F1E9",
  fonts: { display: "Instrument Serif", body: "Manrope" },
});
