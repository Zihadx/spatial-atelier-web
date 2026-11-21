import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import StudioIntro from "@/components/home/StudioIntro";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import ProjectCategories from "@/components/home/ProjectCategories";
import SpatialExperience from "@/components/home/SpatialExperience";
import ServicesOverview from "@/components/home/ServicesOverview";
import MaterialsShowcase from "@/components/home/MaterialsShowcase";
import DesignPhilosophy from "@/components/home/DesignPhilosophy";
import DesignProcess from "@/components/home/DesignProcess";
import StudioStory from "@/components/home/StudioStory";
import TeamSection from "@/components/home/TeamSection";
import Testimonials from "@/components/home/Testimonials";
import JournalPreview from "@/components/home/JournalPreview";
import ConsultationCTA from "@/components/home/ConsultationCTA";
import ContactPreview from "@/components/home/ContactPreview";
import LightStudy from "@/components/home/LightStudy";
import Engagement from "@/components/home/Engagement";

export const metadata: Metadata = {
  title: { absolute: "Atelier Verre — Luxury Interior Architecture & Design" },
  description: "An immersive 3D walk through Atelier Verre, a luxury interior design studio concept: spaces of stone, timber, bronze and light.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <StudioIntro index="01" />
      <FeaturedProjects index="02" />
      <ProjectCategories index="03" />
      <SpatialExperience index="04" />
      <LightStudy index="05" />
      <ServicesOverview index="06" />
      <MaterialsShowcase index="07" />
      <DesignPhilosophy index="08" />
      <DesignProcess index="09" />
      <Engagement index="10" />
      <StudioStory index="11" />
      <TeamSection index="12" />
      <Testimonials index="13" />
      <JournalPreview index="14" />
      <ConsultationCTA index="15" />
      <ContactPreview index="16" />
    </>
  );
}
