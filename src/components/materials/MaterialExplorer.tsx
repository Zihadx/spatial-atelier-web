"use client";
import Image from "next/image";
import { useState } from "react";
import { MaterialCanvas } from "@/components/three/scenes";
import { MATERIALS, MATERIAL_BY_ID } from "@/data/materials";
import { cn } from "@/lib/utils";
import type { MaterialId } from "@/types";

export default function MaterialExplorer() {
  const [id, setId] = useState<MaterialId>("travertine");
  const m = MATERIAL_BY_ID[id];
  return (
    <section className="section surface-ink" aria-label="Material library">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="aspect-square lg:col-span-6" data-cursor="Rotate"><MaterialCanvas material={id} /></div>
          <div className="lg:col-span-6" aria-live="polite">
            <p className="eyebrow mb-3">{m.family}</p>
            <h2 className="display-l">{m.name}</h2>
            <p className="lead mt-6 text-sandstone">{m.detail}</p>
            <dl className="mt-10 grid gap-8 sm:grid-cols-3 text-sm">
              <div><dt className="eyebrow mb-2">Character</dt><dd>{m.character.join(", ")}</dd></div>
              <div><dt className="eyebrow mb-2">Used for</dt><dd>{m.use.join(", ")}</dd></div>
              <div><dt className="eyebrow mb-2">Care</dt><dd>{m.care}</dd></div>
            </dl>
            <div className="relative mt-10 aspect-[16/9] overflow-hidden"><Image src={m.plate} alt={`${m.name} macro texture study`} fill sizes="50vw" className="object-cover" /><span className="absolute bottom-3 left-3 bg-charcoal/70 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em]">Generated texture study</span></div>
          </div>
        </div>
        <ul className="mt-20 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {MATERIALS.map((x) => (
            <li key={x.id}>
              <button type="button" aria-pressed={x.id === id} onClick={() => setId(x.id)} className={cn("group relative block aspect-[4/5] w-full overflow-hidden text-left transition-all duration-500", x.id === id ? "ring-2 ring-bronze" : "opacity-75 hover:opacity-100")}>
                <Image src={x.plate} alt="" fill sizes="20vw" className="object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/85 to-transparent p-4 pt-10"><span className="display-s block">{x.name}</span><span className="text-xs text-sandstone">{x.family}</span></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
