"use client";
import Image from "next/image";
import { useState } from "react";
import { MaterialCanvas } from "@/components/three/scenes";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { MaterialInfo } from "@/content";
import { cn } from "@/lib/utils";
import type { MaterialId } from "@/types";

export default function MaterialsShowcase({ index = "07", materials: MATERIALS }: { index?: string; materials: MaterialInfo[] }) {
  const [id, setId] = useState<MaterialId>("travertine");
  const MATERIAL_BY_ID = Object.fromEntries(MATERIALS.map((x) => [x.id, x])) as Record<MaterialId, MaterialInfo>;
  const m = MATERIAL_BY_ID[id];
  return (
    <section className="surface-ink" aria-labelledby="mat-title">
      <div className="container-x section">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading index={index} eyebrow="Material library" title={<span id="mat-title">Made to be <em>touched.</em></span>} />
          <Button href="/materials" variant="line">Open the library</Button>
        </div>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-14">
          <Reveal className="lg:col-span-5"><div className="aspect-square w-full" data-cursor="Rotate"><MaterialCanvas material={id} /></div></Reveal>
          <div className="lg:col-span-7">
            <ul className="grid grid-cols-5 gap-2" role="list">
              {MATERIALS.map((x) => (
                <li key={x.id}>
                  <button type="button" aria-pressed={x.id === id} aria-label={x.name} onClick={() => setId(x.id)} className={cn("relative block aspect-square w-full overflow-hidden transition-all duration-500", x.id === id ? "ring-2 ring-bronze ring-offset-2 ring-offset-charcoal" : "opacity-65 hover:opacity-100")}>
                    <Image src={x.albedo} alt="" fill sizes="96px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-10" aria-live="polite">
              <p className="eyebrow mb-2">{m.family}</p>
              <h3 className="display-m">{m.name}</h3>
              <p className="lead mt-5 text-sandstone">{m.detail}</p>
              <dl className="mt-7 grid grid-cols-2 gap-6 text-sm">
                <div><dt className="eyebrow mb-2">Character</dt><dd>{m.character.join(" · ")}</dd></div>
                <div><dt className="eyebrow mb-2">Used for</dt><dd>{m.use.join(" · ")}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
