import LegalPage from "@/components/ui/LegalPage";
import { buildMetadata } from "@/lib/seo";
import { getBrand, getContact } from "@/lib/site";

export const metadata = buildMetadata({ title: "Terms of Use", description: `Terms for using the ${getBrand().name} website.`, path: "/terms" });

export default function Terms() {
  const brand = getBrand(), contact = getContact();
  return <LegalPage title="Terms of use" updated="25 November 2026" sections={[
    ["Use of this site", `This website presents the work and approach of ${brand.name}, including concept projects shown as illustrative design studies. Nothing on it is an offer or a contract; the terms of any project are agreed in writing.`],
    ["Intellectual property", "Design content, text and renders belong to the studio. Third-party photography is credited to its photographers under the Unsplash licence, and 3D models are used under their CC-BY 4.0 licences."],
    ["No warranty", "The site and its content are provided as is. We take care to keep information accurate but do not guarantee that it is complete or current."],
    ["Contact", `Questions about these terms can be sent to ${contact.emails.primary}.`],
  ]} />;
}
