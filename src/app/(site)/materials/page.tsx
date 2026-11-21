import type { Metadata } from "next";
import Image from "next/image";
import ConsultationCTA from "@/components/home/ConsultationCTA";
import MaterialExplorer from "@/components/materials/MaterialExplorer";
import PageHero from "@/components/ui/PageHero";
import Reveal from "@/components/ui/Reveal";
import { MATERIAL_BY_ID, MATERIAL_PAIRINGS } from "@/data/materials";

export const metadata: Metadata = {
  title: "Materials",
  description: "An interactive library of travertine, marble, walnut, oak, bronze, boucle, linen, stone, plaster and reeded glass.",
  alternates: { canonical: "/materials" },
};

export default function MaterialsPage() {
  return (
    <>
      <PageHero eyebrow="Material library" title={<>Surfaces you can <em>feel.</em></>} lead="Ten materials as 3D samples and macro studies. Select one to rotate it under studio light." photo={{ src: "/images/materials/travertine.jpg", fallback: "/images/materials/travertine.jpg", alt: "Macro texture study of travertine" }} />
      <MaterialExplorer />
      <section className="section surface-sand" aria-labelledby="combos">
        <div className="container-x">
          <h2 id="combos" className="display-l mb-16">Material <em>combinations.</em></h2>
          <div className="grid gap-12 md:grid-cols-2">
            {MATERIAL_PAIRINGS.map((p) => (
              <Reveal key={p.title}>
                <div className="grid grid-cols-3 gap-1">{p.ids.map((id) => <div key={id} className="relative aspect-[3/4] overflow-hidden"><Image src={MATERIAL_BY_ID[id].plate} alt={`${MATERIAL_BY_ID[id].name} texture study`} fill sizes="20vw" className="object-cover" /></div>)}</div>
                <h3 className="display-s mt-5">{p.title}</h3><p className="mt-2 text-sm text-espresso/75">{p.note}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-16 text-xs text-espresso/70">Textures and plates are procedurally generated studio studies, not photographs of real samples.</p>
        </div>
      </section>
      <ConsultationCTA index="→" />
    </>
  );
}
