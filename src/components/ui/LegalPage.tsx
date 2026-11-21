import PageHero from "./PageHero";
import { PHOTO } from "@/data/photos";

export default function LegalPage({ title, sections }: { title: string; sections: [string, string][] }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} lead="Template text for a demonstration site. Have qualified counsel review and complete it before launch." photo={PHOTO.contactHero} />
      <section className="surface-warm"><div className="container-x section"><div className="prose-measure mx-auto space-y-10">
        {sections.map(([h, p]) => <div key={h}><h2 className="display-s">{h}</h2><p className="mt-3 text-espresso/80">{p}</p></div>)}
      </div></div></section>
    </>
  );
}
