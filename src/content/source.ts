import type { Article, Category, FaqItem, MaterialInfo, MaterialPairing, MethodStep, Project, Service, StudioContent } from "./types";

/**
 * The seam between the UI and wherever content lives.
 *
 * To move to a CMS or database (Sanity, Payload, Supabase…): implement this interface, map the provider's
 * documents to the types in ./types, and return it from `getContent()` in ./index.ts. No component changes needed,
 * because pages call these methods and pass plain data down as props. Implementations should throw on failure
 * (pages are server components, so Next's error boundary handles it) and return `null` for "not found".
 */
export interface ContentSource {
  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  getCategories(): Promise<Category[]>;
  getServices(): Promise<Service[]>;
  getServiceMethod(): Promise<MethodStep[]>;
  getFaq(): Promise<FaqItem[]>;
  getArticles(): Promise<Article[]>;
  getArticle(slug: string): Promise<Article | null>;
  getMaterials(): Promise<MaterialInfo[]>;
  getMaterialPairings(): Promise<MaterialPairing[]>;
  getStudio(): Promise<StudioContent>;
}
