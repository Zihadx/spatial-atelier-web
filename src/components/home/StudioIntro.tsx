import Link from "next/link";
import { getBrand } from "@/lib/site";
import CountUp from "@/components/ui/CountUp";
import ImageReveal from "@/components/ui/ImageReveal";
import Marquee from "@/components/ui/Marquee";
import Reveal from "@/components/ui/Reveal";
import RevealText from "@/components/ui/RevealText";
import SectionLabel from "@/components/ui/SectionLabel";
import { PHOTO } from "@/data/photos";

const STATS: [number, string][] = [[7, "Design disciplines"], [10, "Studied materials"], [6, "Guiding principles"]];

/** Hero → story bridge: an editorial statement, one photograph, three factual counters, then a ticker into the work. */
export default function StudioIntro({ index = "01" }: { index?: string }) {
  return (
    <section className="surface-warm" aria-labelledby="intro-title">
      <div className="container-x section">
        <SectionLabel index={index} label="The studio" />
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-7">
            <RevealText as="h2" by="words" className="display-l"><span id="intro-title">An Art of Living, <em>Defined by Space.</em></span></RevealText>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <Reveal><p className="lead">{getBrand().name} designs interiors the way an architect designs a house: from light, proportion and material outwards, until every room feels inevitable.</p></Reveal>
              <Reveal delay={0.12}>
                <p className="text-muted">Stone, timber, bronze and soft weave are chosen for how they age and how they feel under the hand.</p>
                <Link href="/studio" className="link-u mt-7">About the studio</Link>
              </Reveal>
            </div>
            <dl className="mt-14 grid grid-cols-3 border-t border-espresso/15">
              {STATS.map(([n, l]) => (
                <Reveal key={l} className="flex flex-col-reverse justify-end border-r border-espresso/15 py-6 pr-4 last:border-r-0 [&:not(:first-child)]:pl-6">
                  <dt className="eyebrow mt-1">{l}</dt>
                  <dd className="num text-5xl md:text-6xl"><CountUp to={n} /></dd>
                </Reveal>
              ))}
            </dl>
          </div>
          <ImageReveal photo={PHOTO.introStudio} frame="portrait" className="lg:col-span-5" sizes="(min-width: 1024px) 38vw, 100vw" caption="Reference photography" />
        </div>
      </div>
      <Marquee items={["Residential", "Villas", "Hospitality", "Commercial", "Bespoke", "Space planning", "Materials"]} className="border-t border-espresso/15 py-8" />
    </section>
  );
}
