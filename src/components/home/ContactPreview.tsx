import ContactForm from "@/components/contact/ContactForm";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { SITE } from "@/lib/constants";

export default function ContactPreview({ index = "14" }: { index?: string }) {
  return (
    <section className="surface-warm" aria-labelledby="contact-title">
      <div className="container-x section grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading index={index} eyebrow="Contact" title={<span id="contact-title">Tell us about <em>your space.</em></span>} size="m" />
          <Reveal className="mt-10 space-y-5 text-sm" delay={0.15}>
            <div><p className="eyebrow mb-1.5">Email</p><a className="link-u" href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
            <div><p className="eyebrow mb-1.5">Phone</p><p>{SITE.phone}</p></div>
            <div><p className="eyebrow mb-1.5">Studio</p><p className="text-muted">{SITE.address}</p></div>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-8"><ContactForm /></Reveal>
      </div>
    </section>
  );
}
