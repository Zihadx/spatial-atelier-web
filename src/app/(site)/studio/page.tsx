import { getContent, type MaterialInfo } from "@/content";
import { buildMetadata } from "@/lib/seo";
import { getBrand } from "@/lib/site";
import Image from "next/image";
import DesignPhilosophy from "@/components/home/DesignPhilosophy";
import StudioStory from "@/components/home/StudioStory";
import TeamSection from "@/components/home/TeamSection";
import ConsultationCTA from "@/components/home/ConsultationCTA";
import Button from "@/components/ui/Button";
import PageHero from "@/components/ui/PageHero";
import { PHOTO } from "@/data/photos";
import Reveal from "@/components/ui/Reveal";

export const metadata = buildMetadata({ title: "Studio", description: `The philosophy, approach and values behind ${getBrand().name}, a luxury interior architecture and design studio.`, path: "/studio" });

const APPROACH = [
  ["Architecture first", "We read the shell of a building before we draw a single piece of furniture."],
  ["Few materials, used well", "A tight palette repeated with intent creates calm and continuity."],
  ["Previewed in 3D", "Walkable models test proportion and light long before work begins."],
];

export default async function StudioPage() {
  const content = getContent();
  const [studio, materials, MATERIAL_PAIRINGS] = await Promise.all([content.getStudio(), content.getMaterials(), content.getMaterialPairings()]);
  const MATERIAL_BY_ID = Object.fromEntries(materials.map((m) => [m.id, m])) as Record<MaterialInfo["id"], MaterialInfo>;
  const brand = getBrand();
  return (
    <>
      <PageHero eyebrow="Studio" title={<>Calm rooms, <em>considered.</em></>} lead={`${brand.name} is a studio exploring how stone, timber, bronze and daylight can make a home feel inevitable.`} photo={PHOTO.studioHero} />
      <section className="section surface-warm" aria-labelledby="approach">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <h2 id="approach" className="display-l lg:col-span-5">Studio <em>approach.</em></h2>
          <ol className="lg:col-span-7">{APPROACH.map(([t, d], i) => <li key={t}><Reveal className="grid grid-cols-[4rem_1fr] gap-6 border-t border-espresso/20 py-10"><span className="num text-4xl text-bronze">0{i + 1}</span><div><h3 className="display-s">{t}</h3><p className="mt-3 max-w-md text-espresso/75">{d}</p></div></Reveal></li>)}</ol>
        </div>
      </section>
      <DesignPhilosophy index="02" items={studio.philosophy} />
      <StudioStory index="03" values={studio.values} brandName={brand.name} />
      <section className="section surface-sand" aria-labelledby="matthink">
        <div className="container-x">
          <h2 id="matthink" className="display-l mb-6">Material <em>thinking.</em></h2>
          <p className="lead mb-16">Materials are chosen in families that share warmth, grain and weight.</p>
          <div className="grid gap-12 md:grid-cols-2">
            {MATERIAL_PAIRINGS.map((p) => (
              <Reveal key={p.title}>
                <div className="grid grid-cols-3 gap-1">{p.ids.map((id) => <div key={id} className="relative aspect-[3/4] overflow-hidden"><Image src={MATERIAL_BY_ID[id].plate} alt={`${MATERIAL_BY_ID[id].name} texture study`} fill sizes="20vw" className="object-cover" /></div>)}</div>
                <h3 className="display-s mt-5">{p.title}</h3><p className="mt-2 text-sm text-espresso/75">{p.ids.map((i) => MATERIAL_BY_ID[i].name).join(" · ")} — {p.note}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-16"><Button href="/materials" variant="dark">Explore the material library</Button></div>
        </div>
      </section>
      <TeamSection index="05" />
      <ConsultationCTA index="→" />
    </>
  );
}
