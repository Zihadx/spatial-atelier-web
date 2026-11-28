import ContactDetails from "@/components/contact/ContactDetails";
import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo";
import { getBrand, getContact } from "@/lib/site";
import ContactForm from "@/components/contact/ContactForm";
import Faq from "@/components/ui/Faq";
import PageHero from "@/components/ui/PageHero";
import { PHOTO } from "@/data/photos";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

export const metadata = buildMetadata({ title: "Contact", description: `Start a project with ${getBrand().name}: tell us about the space, budget and location.`, path: "/contact" });

export default async function ContactPage() {
  const content = getContent();
  const [categories, FAQ] = await Promise.all([content.getCategories(), content.getFaq()]);
  const contact = getContact();
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Begin a <em>conversation.</em></>} lead="Tell us about the space and how you want it to feel." photo={PHOTO.contactHero} />
      <section className="section surface-warm" aria-labelledby="inq">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="inq" className="display-m">Project <em>inquiry.</em></h2>
            <Reveal className="mt-10" delay={0.1}><ContactDetails /></Reveal>
          </div>
          <div className="lg:col-span-8"><ContactForm projectTypes={categories.map((c) => c.label)} budgetRanges={contact.form.budgetRanges} fallbackEmail={contact.emails.primary} /></div>
        </div>
      </section>
      <section className="section surface-sand" aria-labelledby="cfaq">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <h2 id="cfaq" className="display-m lg:col-span-4">Before you <em>write.</em></h2>
          <div className="lg:col-span-8"><Faq items={FAQ.slice(0, 4)} /></div>
        </div>
      </section>
      <section className="section surface-dark text-center"><div className="container-x"><h2 className="display-l mx-auto max-w-[14ch]">Prefer to <em>look first?</em></h2><div className="mt-10"><Button href="/projects">Explore our work</Button></div></div></section>
    </>
  );
}
