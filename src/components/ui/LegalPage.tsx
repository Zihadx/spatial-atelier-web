import PageHero from "./PageHero";
import { PHOTO } from "@/data/photos";

export default function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: [string, string][] }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} lead={`Last updated ${updated}. This text describes how this website works and should be reviewed by qualified counsel before launch.`} photo={PHOTO.contactHero} />
      <section className="surface-warm"><div className="container-x section"><div className="prose-measure mx-auto space-y-10">
        {sections.map(([h, p]) => <div key={h}><h2 className="display-s">{h}</h2><p className="mt-3 text-espresso/80">{p}</p></div>)}
      </div></div></section>
    </>
  );
}
