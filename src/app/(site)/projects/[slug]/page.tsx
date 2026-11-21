import type { Metadata } from "next";
import Photo from "@/components/ui/Photo";
import { PROJECT_PHOTO } from "@/data/photos";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectExplorer from "@/components/projects/ProjectExplorer";
import NextProject from "@/components/projects/NextProject";
import Button from "@/components/ui/Button";
import ImageReveal from "@/components/ui/ImageReveal";
import Reveal from "@/components/ui/Reveal";
import RevealText from "@/components/ui/RevealText";
import { MATERIAL_BY_ID } from "@/data/materials";
import { CATEGORY_BY_ID, PROJECTS, PROJECT_BY_SLUG } from "@/data/projects";
import { CONCEPT_NOTE } from "@/lib/constants";

const LIGHT_LABEL = { natural: "Daylight-led", warm: "Warm, golden-hour", dusk: "Evening-led" } as const;
const LAYOUT_LABEL = { gallery: "Gallery living", library: "Library lounge", suite: "Hotel suite", office: "Open workplace", pavilion: "Glass pavilion", dining: "Dining room", nocturne: "Evening living", court: "Courtyard living" } as const;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return PROJECTS.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = PROJECT_BY_SLUG[slug];
  if (!p) return {};
  return {
    title: p.title, description: p.summary, alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title: p.title, description: p.summary, images: [{ url: p.images[0], width: 1920, height: 1200, alt: `${p.title} concept render` }] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = PROJECT_BY_SLUG[slug];
  if (!p) notFound();
  const i = PROJECTS.findIndex((x) => x.slug === slug);
  const prev = PROJECTS[(i + PROJECTS.length - 1) % PROJECTS.length];
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const related = PROJECTS.filter((x) => x.slug !== slug).sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category)).slice(0, 2);
  const cat = CATEGORY_BY_ID[p.category];
  return (
    <>
      <section className="surface-ink relative isolate flex min-h-[100svh] items-end overflow-hidden">
        <div className="absolute inset-0 -z-20"><Photo photo={PROJECT_PHOTO[p.slug]} priority sizes="100vw" /></div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/30 to-charcoal/20" aria-hidden />
        <div className="container-x pb-20 pt-40">
          <p className="eyebrow mb-6 !text-sandstone">{cat.label} · Concept project</p>
          <RevealText as="h1" className="display-xl max-w-[12ch]">{p.title}</RevealText>
          <p className="lead mt-8 text-sandstone">{p.summary}</p>
        </div>
      </section>

      <section className="section surface-warm" aria-labelledby="overview">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <dl className="grid grid-cols-2 gap-8 lg:col-span-4 lg:grid-cols-1">
            {[["Type", p.type], ["Category", cat.label], ["Scale", p.area], ["Location", p.location]].map(([k, v]) => (
              <Reveal key={k} className="border-t border-espresso/20 pt-4"><dt className="eyebrow mb-2">{k}</dt><dd className="display-s">{v}</dd></Reveal>
            ))}
          </dl>
          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal><p className="eyebrow mb-6" id="overview">Design concept</p></Reveal>
            <RevealText as="p" className="display-m">{p.concept}</RevealText>
            <Reveal as="ol" stagger={0.12} className="mt-12">{p.details.map((d, n) => <li key={d} className="grid grid-cols-[3.5rem_1fr] items-baseline gap-4 border-t border-espresso/20 py-5"><span className="num text-3xl text-bronze">0{n + 1}</span><span className="display-s">{d}</span></li>)}</Reveal>
            <p className="mt-10 text-xs text-muted">{CONCEPT_NOTE}</p>
          </div>
        </div>
      </section>

      <section className="surface-sand" aria-label="Specification">
        <div className="container-x py-12">
          <dl className="grid gap-8 md:grid-cols-4">
            {[["Lighting scheme", LIGHT_LABEL[p.preset.light]], ["Spatial type", LAYOUT_LABEL[p.preset.layout]], ["Primary materials", p.materials.map((m) => MATERIAL_BY_ID[m].name).join(", ")], ["Status", "Concept — not built"]].map(([k, v]) => (
              <div key={k} className="border-t border-espresso/25 pt-4"><dt className="eyebrow mb-2">{k}</dt><dd className="display-s">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="surface-dark section" aria-labelledby="spatial">
        <div className="container-x">
          <div className="mb-12 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5"><p className="eyebrow mb-5">Spatial planning</p><h2 id="spatial" className="display-l">Step <em>inside.</em></h2></div>
            <p className="lead lg:col-span-6 lg:col-start-7">{p.spatial}</p>
          </div>
          <ProjectExplorer project={p} />
        </div>
      </section>

      <section className="section surface-sand" aria-labelledby="palette">
        <div className="container-x">
          <p className="eyebrow mb-5">Material palette</p>
          <h2 id="palette" className="display-l mb-16">What it&rsquo;s <em>made of.</em></h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {p.materials.map((m, n) => {
              const info = MATERIAL_BY_ID[m];
              return (
                <li key={m} className={n % 2 ? "md:mt-12" : ""}>
                  <Link href="/materials" className="group block" data-cursor="Material">
                    <div className="frame frame-portrait"><div className="absolute inset-0 transition-transform duration-[1500ms] ease-[var(--ease-cine)] group-hover:scale-110"><Photo photo={{ src: info.plate, fallback: info.plate, alt: `${info.name} texture study` }} sizes="25vw" /></div></div>
                    <p className="display-s mt-4">{info.name}</p><p className="text-sm text-espresso/70">{info.short}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section surface-warm" aria-labelledby="gallery">
        <div className="container-x">
          <h2 id="gallery" className="eyebrow mb-10">Gallery — reference photography and 3D concept views</h2>
          <div className="grid items-start gap-6 lg:grid-cols-12">
            <ImageReveal photo={PROJECT_PHOTO[p.slug]} frame="wide" className="lg:col-span-12" sizes="(min-width: 1024px) 90vw, 100vw" zoom caption="Reference photography (Unsplash)" />
            <ImageReveal photo={{ src: p.images[1], fallback: p.images[1], alt: `${p.title}, 3D concept detail` }} frame="landscape" className="lg:col-span-6" caption="3D concept — detail" />
            <ImageReveal photo={{ src: p.images[2], fallback: p.images[2], alt: `${p.title}, 3D concept oblique view` }} frame="landscape" className="lg:col-span-6" caption="3D concept — oblique" />
          </div>
        </div>
      </section>

      <section className="section surface-ink" aria-labelledby="related">
        <div className="container-x">
          <h2 id="related" className="display-m mb-16">Related <em>projects.</em></h2>
          <div className="grid gap-12 md:grid-cols-2">{related.map((r, n) => <ProjectCard key={r.slug} project={r} index={n} frame="frame-landscape" />)}</div>
          <nav aria-label="Project navigation" className="mt-20 border-t border-ivory/20 pt-8"><Link href={`/projects/${prev.slug}`} className="link-u"><ArrowLeft size={14} aria-hidden /> Previous: {prev.title}</Link></nav>
        </div>
      </section>

      <NextProject project={next} />
      <section className="section surface-dark text-center">
        <div className="container-x">
          <h2 className="display-l mx-auto max-w-[14ch]">Imagine a room like <em>this</em> at home.</h2>
          <div className="mt-10"><Button href="/contact">Enquire about a similar space</Button></div>
        </div>
      </section>
    </>
  );
}
