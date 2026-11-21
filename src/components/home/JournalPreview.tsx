import Link from "next/link";
import Button from "@/components/ui/Button";
import Photo from "@/components/ui/Photo";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { JOURNAL } from "@/data/journal";
import { JOURNAL_PHOTO } from "@/data/photos";

/** Three equal editorial tiles — same frame ratio, same type scale, so the row reads as one system. */
export default function JournalPreview({ index = "12" }: { index?: string }) {
  return (
    <section className="surface-warm" aria-labelledby="journal-title">
      <div className="container-x section">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading index={index} eyebrow="Journal" title={<span id="journal-title">Notes on <em>living well.</em></span>} />
          <Button href="/journal" variant="line-dark">All stories</Button>
        </div>
        <Reveal stagger={0.12} as="ul" className="grid gap-x-6 gap-y-12 md:grid-cols-3">
          {JOURNAL.slice(0, 3).map((a) => (
            <li key={a.slug}>
              <Link href={`/journal/${a.slug}`} className="group block" data-cursor="Read">
                <div className="frame frame-landscape"><div className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-cine)] group-hover:scale-105"><Photo photo={JOURNAL_PHOTO[a.slug]} sizes="(min-width: 768px) 32vw, 100vw" /></div></div>
                <p className="eyebrow mt-5">{a.topic} · {a.read}</p>
                <h3 className="display-s mt-2 transition-colors duration-500 group-hover:text-bronze">{a.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{a.excerpt}</p>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
