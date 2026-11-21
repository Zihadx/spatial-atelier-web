export type MaterialId =
  | "travertine" | "marble" | "walnut" | "oak" | "bronze"
  | "boucle" | "linen" | "stone" | "plaster" | "glass";

export type LightMode = "natural" | "warm" | "dusk";

export type Layout =
  | "gallery" | "library" | "suite" | "office" | "pavilion" | "dining" | "nocturne" | "court";

export type Vec3 = [number, number, number];

export interface ScenePreset {
  layout: Layout;
  wall: MaterialId;
  floor: MaterialId;
  accent: MaterialId;
  textile: MaterialId;
  light: LightMode;
  cam: { pos: Vec3; look: Vec3 };
}

export type CategoryId =
  | "residential" | "luxury-apartments" | "private-villas"
  | "hospitality" | "commercial" | "bespoke-interiors";

export interface Project {
  slug: string;
  title: string;
  category: CategoryId;
  type: string;
  location: string;
  area: string;
  summary: string;
  concept: string;
  spatial: string;
  details: string[];
  materials: MaterialId[];
  preset: ScenePreset;
  images: string[];
}

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
  image: string;
}
