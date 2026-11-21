import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms for using the Atelier Verre website.", alternates: { canonical: "/terms" } };

export default function Terms() {
  return <LegalPage title="Terms of use" sections={[
    ["Use of this site", "This website presents concept work and sample content for demonstration. Nothing on it constitutes an offer or a contract."],
    ["Intellectual property", "Design content belongs to the studio. Third-party photography is credited to its photographers under the Unsplash licence. 3D models are used under their CC-BY 4.0 licences."],
    ["No warranty", "Content is provided as is. [Have counsel adapt limitation-of-liability language.]"],
    ["Contact", "Questions about these terms may be sent to the studio email shown on the contact page."],
  ]} />;
}
