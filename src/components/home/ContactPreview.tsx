import ContactForm from "@/components/contact/ContactForm";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ContactDetails from "@/components/contact/ContactDetails";
import { getContent } from "@/content";
import { getContact } from "@/lib/site";

export default async function ContactPreview({ index = "14" }: { index?: string }) {
  const [categories, contact] = [await getContent().getCategories(), getContact()];
  return (
    <section className="surface-warm" aria-labelledby="contact-title">
      <div className="container-x section grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading index={index} eyebrow="Contact" title={<span id="contact-title">Tell us about <em>your space.</em></span>} size="m" />
          <Reveal className="mt-10" delay={0.15}><ContactDetails variant="compact" /></Reveal>
        </div>
        <Reveal className="lg:col-span-8"><ContactForm projectTypes={categories.map((c) => c.label)} budgetRanges={contact.form.budgetRanges} fallbackEmail={contact.emails.primary} /></Reveal>
      </div>
    </section>
  );
}
