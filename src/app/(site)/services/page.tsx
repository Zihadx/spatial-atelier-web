import type { Metadata } from "next";
import ConsultationCTA from "@/components/home/ConsultationCTA";
import ServiceShowcase from "@/components/services/ServiceShowcase";
import Faq from "@/components/ui/Faq";
import PageHero from "@/components/ui/PageHero";
import Engagement from "@/components/home/Engagement";
import { PHOTO } from "@/data/photos";
import Reveal from "@/components/ui/Reveal";
import { FAQ, METHOD } from "@/data/services";
import { PROCESS } from "@/data/studio";

export const metadata: Metadata = {
  title: "Services",
  description: "Residential, villa and commercial interior design, space planning, furniture and styling, material selection and renovation consultation.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title={<>Everything a room <em>needs.</em></>} lead="Seven disciplines, delivered by one team, so that planning, materials and furniture are always working toward the same idea." photo={PHOTO.servicesHero} />
      <ServiceShowcase />
      <Engagement index="→" />
      <section className="section surface-dark" aria-labelledby="method">
        <div className="container-x">
          <h2 id="method" className="display-l mb-16">Design <em>methodology.</em></h2>
          <Reveal stagger={0.12} className="grid gap-px bg-ivory/15 md:grid-cols-4">
            {METHOD.map((m, i) => <div key={m.t} className="bg-espresso p-8"><p className="num text-5xl text-bronze">0{i + 1}</p><h3 className="display-s mt-6">{m.t}</h3><p className="mt-3 text-sm text-sandstone">{m.d}</p></div>)}
          </Reveal>
        </div>
      </section>
      <section className="section surface-sand" aria-labelledby="proc">
        <div className="container-x">
          <h2 id="proc" className="display-l mb-16">The <em>process.</em></h2>
          <ol className="divide-y divide-espresso/20 border-y border-espresso/20">
            {PROCESS.map((p) => (
              <li key={p.n}><Reveal className="grid gap-4 py-8 md:grid-cols-12 md:items-baseline"><span className="num text-4xl text-bronze md:col-span-1">{p.n}</span><h3 className="display-s md:col-span-4">{p.t}</h3><p className="text-espresso/75 md:col-span-5">{p.d}</p><p className="eyebrow md:col-span-2 md:text-right">{p.out}</p></Reveal></li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section surface-warm" aria-labelledby="faq">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <h2 id="faq" className="display-l lg:col-span-4">Good <em>questions.</em></h2>
          <div className="lg:col-span-8"><Faq items={FAQ} /></div>
        </div>
      </section>
      <ConsultationCTA index="→" />
    </>
  );
}
