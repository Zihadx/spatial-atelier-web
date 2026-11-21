import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/ui/PageHero";
import ReadingProgress from "@/components/ui/ReadingProgress";
import { JOURNAL_PHOTO } from "@/data/photos";
import { JOURNAL } from "@/data/journal";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return JOURNAL.map((a) => ({ slug: a.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = JOURNAL.find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.excerpt, alternates: { canonical: `/journal/${a.slug}` } } : {};
}

export default async function Article({ params }: Props) {
  const { slug } = await params;
  const a = JOURNAL.find((x) => x.slug === slug);
  if (!a) notFound();
  const more = JOURNAL.filter((x) => x.slug !== slug).slice(0, 3);
  return (
    <>
      <PageHero eyebrow={`${a.topic} · ${a.read} read`} title={a.title} lead={a.excerpt} photo={JOURNAL_PHOTO[a.slug]} />
      <ReadingProgress target="#article-body" />
      <article id="article-body" className="section surface-warm"><div className="container-x"><div className="prose-measure mx-auto space-y-8 text-lg leading-relaxed">{a.body.map((p, i) => (<div key={i} className="space-y-8"><p className={i === 0 ? "display-s" : ""}>{p}</p>{i === 0 && <blockquote className="border-l-2 border-bronze pl-6 font-display text-3xl italic text-bronze md:text-4xl">{a.pull}</blockquote>}</div>))}</div></div></article>
      <section className="section surface-sand"><div className="container-x"><h2 className="display-m mb-12">Keep <em>reading.</em></h2><ul className="grid gap-8 md:grid-cols-3">{more.map((m) => <li key={m.slug}><Link href={`/journal/${m.slug}`} className="group block"><p className="eyebrow">{m.topic}</p><p className="display-s mt-2 transition-colors group-hover:text-bronze">{m.title}</p></Link></li>)}</ul></div></section>
    </>
  );
}
