/** Content models. Any ContentSource (static, CMS, database) must produce exactly these shapes. */
import type { Category, Project } from "@/types";
import type { MaterialInfo } from "@/data/materials";

export type { Category, Project, MaterialInfo };

export interface Service {
  id: string;
  n: string;
  title: string;
  lead: string;
  body: string;
  scope: string[];
  stage: "residence" | "villa" | "commercial" | "plan" | "styling" | "materials" | "renovation";
  layout: "wide" | "tall" | "offset";
}

export interface Article {
  slug: string;
  topic: string;
  title: string;
  excerpt: string;
  read: string;
  image: string;
  body: string[];
  pull: string;
}

export interface MethodStep { t: string; d: string }
export interface FaqItem { q: string; a: string; isMock?: boolean }
export interface PhilosophyItem { n: string; t: string; d: string }
export interface ProcessStage { n: string; t: string; d: string; out: string }
export interface ValueItem { t: string; d: string }
export interface TeamMember { role: string; note: string; tone: "walnut" | "travertine" | "stone" | "plaster"; isMock?: boolean }
export interface Testimonial { quote: string; by: string; isMock?: boolean }
export interface MaterialPairing { title: string; ids: MaterialInfo["id"][]; note: string }

export interface StudioContent {
  philosophy: PhilosophyItem[];
  process: ProcessStage[];
  values: ValueItem[];
  team: TeamMember[];
  testimonials: Testimonial[];
}
