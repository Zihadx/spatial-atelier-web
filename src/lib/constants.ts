export const SITE = {
  name: "Atelier Verre",
  tagline: "The Living Space",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  description:
    "Atelier Verre is a luxury interior architecture and design studio concept: spaces shaped around light, stone, timber and the way you live.",
  email: "studio@atelierverre.example",
  phone: "+00 000 000 0000",
  address: "Studio address placeholder",
} as const;

export const EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
  cinematic: "expo.out",
} as const;

export const CONCEPT_NOTE =
  "Concept project — demonstration content, not client work.";
