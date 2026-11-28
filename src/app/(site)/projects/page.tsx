import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo";
import { getBrand } from "@/lib/site";
import { Suspense } from "react";
import ProjectGallery from "@/components/projects/ProjectGallery";
import ConsultationCTA from "@/components/home/ConsultationCTA";
import PageHero from "@/components/ui/PageHero";
import { PHOTO } from "@/data/photos";

export const metadata = buildMetadata({ title: "Projects", description: `Concept interior projects by ${getBrand().name}: residences, apartments, villas, hospitality, commercial and bespoke interiors.`, path: "/projects" });

export default async function ProjectsPage() {
  const content = getContent();
  const [projects, categories] = await Promise.all([content.getProjects(), content.getCategories()]);
  return (
    <>
      <PageHero eyebrow="Projects — concept work" title={<>Rooms worth <em>walking into.</em></>} lead="Eight concept interiors across six categories. Each opens as an architectural case study with an explorable 3D scene." photo={PHOTO.projectsHero} />
      <Suspense fallback={<div className="section surface-warm" />}><ProjectGallery projects={projects} categories={categories} /></Suspense>
      <ConsultationCTA index="→" />
    </>
  );
}
