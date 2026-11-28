import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo";
import { getBrand } from "@/lib/site";
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

export const metadata = buildMetadata({
  title: `${getBrand().name} — Luxury Interior Architecture & Design`,
  absoluteTitle: true,
  description: `An immersive walk through ${getBrand().name}, a luxury interior design studio: spaces of stone, timber, bronze and light.`,
  path: "/",
});

export default async function Home() {
  const content = getContent();
  const [projects, categories, services, materials, studio] = await Promise.all([content.getProjects(), content.getCategories(), content.getServices(), content.getMaterials(), content.getStudio()]);
  return (
    <>
      <HeroSection />
      <StudioIntro index="01" />
      <FeaturedProjects index="02" projects={projects} categories={categories} />
      <ProjectCategories index="03" projects={projects} categories={categories} />
      <SpatialExperience index="04" />
      <LightStudy index="05" />
      <ServicesOverview index="06" services={services} />
      <MaterialsShowcase index="07" materials={materials} />
      <DesignPhilosophy index="08" items={studio.philosophy} />
      <DesignProcess index="09" stages={studio.process} />
      <Engagement index="10" />
      <StudioStory index="11" values={studio.values} brandName={getBrand().name} />
      <TeamSection index="12" />
      <Testimonials index="13" items={studio.testimonials} />
      <JournalPreview index="14" />
      <ConsultationCTA index="15" />
      <ContactPreview index="16" />
    </>
  );
}
