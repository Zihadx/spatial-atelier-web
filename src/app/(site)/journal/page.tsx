import { getContent } from "@/content";
import { buildMetadata } from "@/lib/seo";
import { getBrand } from "@/lib/site";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import Photo from "@/components/ui/Photo";
import { JOURNAL_PHOTO, PHOTO } from "@/data/photos";
import Reveal from "@/components/ui/Reveal";

export const metadata = buildMetadata({ title: "Journal", description: `Design stories on light, material, furniture and spatial thinking from ${getBrand().name}.`, path: "/journal" });

export default async function JournalPage() {
  const JOURNAL = await getContent().getArticles();
  return (
    <>
      <PageHero eyebrow="Journal" title={<>Notes on <em>living well.</em></>} lead="Short essays on architecture, light, furniture and craft." photo={PHOTO.journalHero} />
      <section className="section surface-warm">
        <div className="container-x grid gap-x-10 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
          {JOURNAL.map((a) => (
            <Reveal key={a.slug} >
              <Link href={`/journal/${a.slug}`} className="group block" data-cursor="Read">
                <div className="frame frame-landscape"><div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-cine)] group-hover:scale-105"><Photo photo={JOURNAL_PHOTO[a.slug]} sizes="(min-width: 1024px) 33vw, 100vw" /></div></div>
                <p className="eyebrow mt-5">{a.topic} · {a.read}</p>
                <h2 className="display-s mt-2 transition-colors group-hover:text-bronze">{a.title}</h2>
                <p className="mt-2 text-sm text-muted">{a.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
