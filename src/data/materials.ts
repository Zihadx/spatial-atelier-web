import type { MaterialId } from "@/types";

export interface MaterialInfo {
  id: MaterialId;
  name: string;
  family: "Stone" | "Timber" | "Metal" | "Textile" | "Surface" | "Glass";
  short: string;
  detail: string;
  character: string[];
  use: string[];
  care: string;
  albedo: string;
  normal: string;
  plate: string;
  /** plank/tile variant used when the material is a floor */
  floorAlbedo?: string;
  floorNormal?: string;
  roughness: number;
  metalness: number;
  repeat: number;
  tint: string;
}

const t = (dir: string, id: string) => ({
  albedo: `/textures/${dir}/${id}_albedo.jpg`,
  normal: `/textures/${dir}/${id}_normal.jpg`,
  plate: `/images/materials/${id}.jpg`,
});

export const MATERIALS: MaterialInfo[] = [
  { id: "travertine", name: "Travertine", family: "Stone", short: "Warm, porous, banded stone.",
    detail: "Travertine records its making in horizontal bands and small voids. Honed, it is soft underfoot and calm in raking light; fluted, it throws long shadows across a wall.",
    character: ["Warm", "Banded", "Honed or fluted"], use: ["Feature walls", "Floors", "Table tops"],
    care: "Seal and use pH-neutral cleaners; avoid acids.", roughness: 0.82, metalness: 0, repeat: 1, tint: "#D9CBB8", ...t("stone", "travertine") },
  { id: "marble", name: "Marble", family: "Stone", short: "Veined, luminous, cool to the touch.",
    detail: "A marble slab is chosen vein by vein. Book-matched, the pattern reads as one continuous gesture; honed, the surface stays quiet and the veining does the talking.",
    character: ["Luminous", "Veined", "Cool"], use: ["Bathrooms", "Kitchen islands", "Statement tops"],
    care: "Honed finishes patinate; reseal periodically.", roughness: 0.28, metalness: 0, repeat: 1, tint: "#F5F1E9", ...t("stone", "marble") },
  { id: "walnut", name: "Walnut", family: "Timber", short: "Deep, dense, richly figured timber.",
    detail: "Walnut brings depth to a room without needing ornament. Oiled rather than lacquered, it keeps its open grain and deepens with light and use.",
    character: ["Deep", "Fine-grained", "Oiled"], use: ["Flooring", "Joinery", "Wall panelling"],
    care: "Hard-wax oil, refreshed every few years.", roughness: 0.5, metalness: 0, repeat: 1, tint: "#60432F", ...t("wood", "walnut"), floorAlbedo: "/textures/wood/walnut_floor_albedo.jpg", floorNormal: "/textures/wood/walnut_floor_normal.jpg" },
  { id: "oak", name: "Oak", family: "Timber", short: "Light, quiet, endlessly adaptable.",
    detail: "Oak is the neutral that never feels neutral: a straight, honest grain that holds a room together. Limed or smoked, it moves easily from warm to cool.",
    character: ["Light", "Straight-grained", "Versatile"], use: ["Floors", "Cabinetry", "Furniture"],
    care: "Oil or matt lacquer; wipe with a damp cloth.", roughness: 0.55, metalness: 0, repeat: 1, tint: "#D9CBB8", ...t("wood", "oak"), floorAlbedo: "/textures/wood/oak_floor_albedo.jpg", floorNormal: "/textures/wood/oak_floor_normal.jpg" },
  { id: "bronze", name: "Brushed Bronze", family: "Metal", short: "Hand-finished metal that ages with grace.",
    detail: "Brushed bronze catches light in long, soft streaks. It is used sparingly — as an edge, a leg, a handle — so that the warmth of the metal reads as punctuation.",
    character: ["Warm", "Brushed", "Patinating"], use: ["Furniture legs", "Inlays", "Hardware"],
    care: "Wax occasionally; embrace the patina.", roughness: 0.32, metalness: 1, repeat: 1, tint: "#A88C67", ...t("metal", "bronze") },
  { id: "boucle", name: "Boucle", family: "Textile", short: "Looped, tactile, sculptural.",
    detail: "Boucle turns upholstery into surface. Its looped yarn softens the silhouette of curved forms and diffuses light into a gentle glow.",
    character: ["Looped", "Soft", "Sculptural"], use: ["Sofas", "Chairs", "Headboards"],
    care: "Vacuum gently; professional cleaning for stains.", roughness: 0.95, metalness: 0, repeat: 1, tint: "#F5F1E9", ...t("fabric", "boucle") },
  { id: "linen", name: "Linen", family: "Textile", short: "Natural weave, softly irregular.",
    detail: "Linen has slubs and a slight crispness that cotton cannot imitate. It filters daylight beautifully and relaxes with use.",
    character: ["Woven", "Breathable", "Relaxed"], use: ["Curtains", "Upholstery", "Bedding"],
    care: "Wash cool; let it crease.", roughness: 0.9, metalness: 0, repeat: 1, tint: "#D9CBB8", ...t("fabric", "linen") },
  { id: "stone", name: "Natural Stone", family: "Stone", short: "Quarried, speckled, grounded.",
    detail: "A honed natural stone brings weight and stillness. Selected for tone and speckle, it anchors floors, courtyards and long counters.",
    character: ["Grounded", "Speckled", "Durable"], use: ["Courtyards", "Floors", "Counters"],
    care: "Seal and clean with neutral soap.", roughness: 0.78, metalness: 0, repeat: 1, tint: "#A99B88", ...t("stone", "stone") },
  { id: "plaster", name: "Plaster", family: "Surface", short: "Hand-trowelled, shifting, soft.",
    detail: "Lime plaster is applied in thin layers and burnished by hand. The wall never looks flat: it holds and releases light as the day moves.",
    character: ["Soft", "Hand-applied", "Matte"], use: ["Walls", "Vaulted ceilings", "Niches"],
    care: "Spot-repair by hand; avoid abrasive cleaning.", roughness: 0.92, metalness: 0, repeat: 1, tint: "#F5F1E9", ...t("plaster", "plaster") },
  { id: "glass", name: "Reeded Glass", family: "Glass", short: "Fluted, filtered, privacy with light.",
    detail: "Reeded glass turns a view into rhythm. It lets daylight through while softening what lies beyond, ideal for partitions and cabinet doors.",
    character: ["Fluted", "Translucent", "Rhythmic"], use: ["Partitions", "Doors", "Cabinetry"],
    care: "Clean with a soft cloth and mild glass cleaner.", roughness: 0.12, metalness: 0, repeat: 1, tint: "#AAB7A1", ...t("glass", "glass") },
];

export const MATERIAL_BY_ID = Object.fromEntries(MATERIALS.map((m) => [m.id, m])) as Record<MaterialId, MaterialInfo>;

export const MATERIAL_PAIRINGS: { title: string; ids: MaterialId[]; note: string }[] = [
  { title: "Quiet warmth", ids: ["travertine", "oak", "linen"], note: "Pale stone, light timber and soft weave for calm, daylight-led rooms." },
  { title: "Library depth", ids: ["walnut", "bronze", "boucle"], note: "Dense timber lit by bronze edges and a soft, looped seat." },
  { title: "Gallery restraint", ids: ["plaster", "marble", "glass"], note: "A matte backdrop, one veined slab and filtered light." },
  { title: "Courtyard calm", ids: ["stone", "oak", "linen"], note: "Grounded stone and timber with a relaxed, natural textile." },
];
