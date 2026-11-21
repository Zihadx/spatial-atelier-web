import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Atelier Verre handles personal data.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return <LegalPage title="Privacy policy" sections={[
    ["What we collect", "Details you submit through the inquiry or newsletter forms: name, email, project type, location and message. [Replace with the studio's actual data practices.]"],
    ["How we use it", "To respond to inquiries and, if you subscribe, to send the journal. We do not sell personal data. [Confirm with counsel.]"],
    ["Cookies and analytics", "This site sets no tracking cookies by default. If analytics are added, describe them here and add a consent mechanism where required."],
    ["Your rights", "You may request access, correction or deletion of your data by emailing the studio. [Add jurisdiction-specific rights.]"],
    ["Third parties", "Photography is delivered from Unsplash's CDN; email may be delivered through a transactional email provider. [List actual processors.]"],
  ]} />;
}
