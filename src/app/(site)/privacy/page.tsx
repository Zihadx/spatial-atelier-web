import LegalPage from "@/components/ui/LegalPage";
import { buildMetadata } from "@/lib/seo";
import { getBrand, getContact } from "@/lib/site";

export const metadata = buildMetadata({ title: "Privacy Policy", description: `How ${getBrand().name} handles personal data.`, path: "/privacy" });

export default function Privacy() {
  const brand = getBrand(), contact = getContact();
  return <LegalPage title="Privacy policy" updated="25 November 2026" sections={[
    ["Who we are", `${brand.name} operates this website. You can contact us at ${contact.emails.primary}.`],
    ["What we collect", "Only what you type into our forms: for a project inquiry, your name, email address, project type, budget range, project location and message; for the newsletter, your email address. We do not ask for anything else."],
    ["How we use it", "To read and reply to your inquiry or, if you subscribe, to send the journal. Messages are delivered to the studio by email through a transactional email provider acting on our behalf. We do not sell personal data or use it for advertising."],
    ["Cookies and analytics", "This website sets no cookies and runs no analytics or advertising trackers. It stores one non-personal flag in your browser session (so the opening animation plays once per visit); it is cleared when you close the tab."],
    ["Third parties", "Our email provider processes the messages you send us. Some photography is delivered from Unsplash's image network. Beyond these, we do not share your data."],
    ["Your rights", `You can ask us to access, correct or delete the personal data we hold about you by emailing ${contact.emails.primary}. If you believe your data has been mishandled you may also complain to your local data-protection authority.`],
  ]} />;
}
