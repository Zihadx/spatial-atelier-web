import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectGallery from "@/components/projects/ProjectGallery";
import ConsultationCTA from "@/components/home/ConsultationCTA";
import PageHero from "@/components/ui/PageHero";
import { PHOTO } from "@/data/photos";

export const metadata: Metadata = {
  title: "Projects",
  description: "Concept interior projects by Atelier Verre: residences, apartments, villas, hospitality, commercial and bespoke interiors.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero eyebrow="Projects — concept work" title={<>Rooms worth <em>walking into.</em></>} lead="Eight concept interiors across six categories. Each opens as an architectural case study with an explorable 3D scene." photo={PHOTO.projectsHero} />
      <Suspense fallback={<div className="section surface-warm" />}><ProjectGallery /></Suspense>
      <ConsultationCTA index="→" />
    </>
  );
}
