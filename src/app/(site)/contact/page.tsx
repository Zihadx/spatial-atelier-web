import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import Faq from "@/components/ui/Faq";
import PageHero from "@/components/ui/PageHero";
import { PHOTO } from "@/data/photos";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { FAQ } from "@/data/services";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Atelier Verre: tell us about the space, budget and location.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Begin a <em>conversation.</em></>} lead="Tell us about the space and how you want it to feel." photo={PHOTO.contactHero} />
      <section className="section surface-warm" aria-labelledby="inq">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="inq" className="display-m">Project <em>inquiry.</em></h2>
            <Reveal className="mt-10 space-y-6 text-sm" delay={0.1}>
              <div><p className="eyebrow mb-2">Email</p><a className="link-u" href={`mailto:${SITE.email}`}>{SITE.email}</a></div>
              <div><p className="eyebrow mb-2">Phone</p><p>{SITE.phone}</p></div>
              <div><p className="eyebrow mb-2">Studio location</p><p className="text-muted">{SITE.address}</p></div>
            </Reveal>
            <div className="mt-10 flex aspect-[4/3] items-center justify-center bg-sandstone text-center text-sm text-espresso/70" role="img" aria-label="Map placeholder"><span className="eyebrow">Map placeholder</span></div>
          </div>
          <div className="lg:col-span-8"><ContactForm /></div>
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
