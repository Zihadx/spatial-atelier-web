import { MATERIALS, MATERIAL_PAIRINGS } from "@/data/materials";
import { CATEGORIES, PROJECTS } from "@/data/projects";
import type { ContentSource } from "../source";
import { JOURNAL } from "./journal";
import { FAQ, METHOD, SERVICES } from "./services";
import { PHILOSOPHY, PROCESS, TEAM, TESTIMONIALS, VALUES } from "./studio";

/** Content that ships with the codebase. Same interface a CMS adapter would implement. */
export function createStaticContentSource(): ContentSource {
  return {
    getProjects: async () => PROJECTS,
    getProject: async (slug) => PROJECTS.find((p) => p.slug === slug) ?? null,
    getCategories: async () => CATEGORIES,
    getServices: async () => SERVICES,
    getServiceMethod: async () => METHOD,
    getFaq: async () => FAQ,
    getArticles: async () => JOURNAL,
    getArticle: async (slug) => JOURNAL.find((a) => a.slug === slug) ?? null,
    getMaterials: async () => MATERIALS,
    getMaterialPairings: async () => MATERIAL_PAIRINGS,
    getStudio: async () => ({ philosophy: PHILOSOPHY, process: PROCESS, values: VALUES, team: TEAM, testimonials: TESTIMONIALS }),
  };
}
