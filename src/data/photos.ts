/**
 * Photography manifest. Every photo is a direct Unsplash CDN URL (free to hotlink under the Unsplash licence;
 * credit is appreciated). IMPORTANT: these IDs were selected without being able to open Unsplash from the build
 * environment, so verify each image and swap any that do not fit. Each slot has a local 3D-render fallback that is
 * used automatically if the remote image fails to load.
 */
export interface Photo {
  src: string;
  fallback: string;
  alt: string;
}

const u = (id: string) => `https://images.unsplash.com/${id}`;
const local = (p: string) => `/images/${p}.jpg`;

export const isRemote = (src: string) => src.startsWith("https://");

export const PHOTO = {
  introStudio: { src: u("photo-1618219908412-a29a1bb7b86e"), fallback: local("architecture/studio-intro"), alt: "Warm, minimal living room with natural light and sculptural furniture" },
  philosophy: { src: u("photo-1586023492125-27b2c045efd7"), fallback: local("architecture/philosophy"), alt: "Calm living space with natural materials and daylight" },
  story: { src: u("photo-1600566753190-17f0baa2a6c3"), fallback: local("architecture/story"), alt: "Contemporary interior with timber and stone detailing" },
  projectsHero: { src: u("photo-1522708323590-d24dbb6b0267"), fallback: local("projects/quiet-gallery-1"), alt: "Elegant apartment interior with large windows" },
  servicesHero: { src: u("photo-1600121848594-d8644e57abab"), fallback: local("architecture/services"), alt: "Refined interior with layered materials" },
  studioHero: { src: u("photo-1616486338812-3dadae4b4ace"), fallback: local("studio/studio-1"), alt: "Light-filled living room with curated furniture" },
  contactHero: { src: u("photo-1560448204-e02f11c3d0e2"), fallback: local("studio/studio-2"), alt: "Quiet interior with warm light" },
  journalHero: { src: u("photo-1493663284031-b7e3aefcae8e"), fallback: local("editorial/light"), alt: "Living room in soft afternoon light" },
  cta: { src: u("photo-1600210492486-724fe5c67fb0"), fallback: local("projects/quiet-gallery-1"), alt: "Luxury living space in warm light" },
  footer: { src: u("photo-1600607687939-ce8a6c25118c"), fallback: local("hero/living-room-dusk"), alt: "Modern residence interior at dusk" },
} satisfies Record<string, Photo>;

/** Reference photography per concept project (mood/atmosphere). The 3D concept renders remain the project's own design imagery. */
export const PROJECT_PHOTO: Record<string, Photo> = {
  "quiet-gallery": { src: u("photo-1600210492486-724fe5c67fb0"), fallback: local("projects/quiet-gallery-1"), alt: "Residential living room with warm stone and soft furniture" },
  "walnut-room": { src: u("photo-1618221195710-dd6b41faaea6"), fallback: local("projects/walnut-room-1"), alt: "Dark timber-clad interior with warm lighting" },
  "sand-pavilion": { src: u("photo-1600585154340-be6161a56a0c"), fallback: local("projects/sand-pavilion-1"), alt: "Modern villa opening to its landscape" },
  "lumen-suite": { src: u("photo-1566073771259-6a8506099945"), fallback: local("projects/lumen-suite-1"), alt: "Hotel suite with soft, indirect light" },
  "atrium-office": { src: u("photo-1497366216548-37526070297c"), fallback: local("projects/atrium-office-1"), alt: "Bright workplace with natural materials" },
  "bronze-table": { src: u("photo-1616486338812-3dadae4b4ace"), fallback: local("projects/bronze-table-1"), alt: "Dining space with a sculptural table" },
  "stone-court-residence": { src: u("photo-1600596542815-ffad4c1539a9"), fallback: local("projects/stone-court-residence-1"), alt: "Courtyard villa with stone and planting" },
  "penthouse-nocturne": { src: u("photo-1600607687939-ce8a6c25118c"), fallback: local("projects/penthouse-nocturne-1"), alt: "Penthouse living room in evening light" },
};

export const SERVICE_PHOTO: Record<string, Photo> = {
  residential: { src: u("photo-1631679706909-1844bbd07221"), fallback: local("projects/quiet-gallery-2"), alt: "Comfortable, layered living room" },
  villa: { src: u("photo-1600047509807-ba8f99d2cdde"), fallback: local("projects/sand-pavilion-2"), alt: "Luxury villa architecture" },
  commercial: { src: u("photo-1556761175-5973dc0f32e7"), fallback: local("projects/atrium-office-2"), alt: "Contemporary commercial interior" },
  planning: { src: u("photo-1484101403633-562f891dc89a"), fallback: local("projects/walnut-room-2"), alt: "Space with clear circulation and open plan" },
  styling: { src: u("photo-1615529182904-14819c35db37"), fallback: local("projects/lumen-suite-2"), alt: "Styled bedroom with curated objects" },
  materials: { src: u("photo-1617806118233-18e1de247200"), fallback: local("projects/bronze-table-2"), alt: "Interior detail showing stone, timber and metal" },
  renovation: { src: u("photo-1600566752355-35792bedcfea"), fallback: local("projects/stone-court-residence-2"), alt: "Renovated interior with restored character" },
};

export const JOURNAL_PHOTO: Record<string, Photo> = {
  "afternoon-light-and-the-living-room": { src: u("photo-1493663284031-b7e3aefcae8e"), fallback: local("editorial/light"), alt: "Living room in afternoon light" },
  "why-travertine-ages-well": { src: u("photo-1600566752355-35792bedcfea"), fallback: local("editorial/travertine"), alt: "Stone surfaces in a warm interior" },
  "the-sculptural-sofa": { src: u("photo-1540518614846-7eded433c457"), fallback: local("editorial/sofa"), alt: "Soft, sculptural furniture in a calm room" },
  "designing-with-timber": { src: u("photo-1505693416388-ac5ce068fe85"), fallback: local("editorial/timber"), alt: "Timber details in a bedroom interior" },
  "a-room-in-three-dimensions": { src: u("photo-1551882547-ff40c63fe5fa"), fallback: local("editorial/spatial"), alt: "Open interior with long sightlines" },
  "reading-the-interior-trends": { src: u("photo-1542314831-068cd1dbfeeb"), fallback: local("editorial/trends"), alt: "Warm minimalist hospitality interior" },
  "living-in-architecture": { src: u("photo-1497366811353-6870744d04b2"), fallback: local("editorial/architecture"), alt: "Architectural interior with strong geometry" },
};

export const CATEGORY_PHOTO: Record<string, Photo> = {
  residential: PROJECT_PHOTO["quiet-gallery"],
  "luxury-apartments": PROJECT_PHOTO["penthouse-nocturne"],
  "private-villas": PROJECT_PHOTO["sand-pavilion"],
  hospitality: PROJECT_PHOTO["lumen-suite"],
  commercial: PROJECT_PHOTO["atrium-office"],
  "bespoke-interiors": PROJECT_PHOTO["bronze-table"],
};
