"use client";
import { useState } from "react";
import { SpatialCanvas } from "@/components/three/scenes";
import PosterGate from "@/components/three/PosterGate";
import type { Focus } from "@/components/three/SpatialScene";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import type { LightMode, MaterialId } from "@/types";

const LIGHTS: { id: LightMode; label: string }[] = [{ id: "natural", label: "Daylight" }, { id: "warm", label: "Golden hour" }, { id: "dusk", label: "Dusk" }];
const WALLS: MaterialId[] = ["travertine", "plaster", "marble", "stone"];
const FLOORS: MaterialId[] = ["walnut", "oak", "stone"];
const FOCUSES: { id: Focus; label: string; text: string }[] = [
  { id: "space", label: "Space", text: "One long room, organised along a single wall so circulation stays free." },
  { id: "light", label: "Light", text: "Glass on the sun side; stone and plaster opposite to hold and soften the glow." },
  { id: "form", label: "Form", text: "A curved sofa softens the rectangle and turns seating into sculpture." },
  { id: "material", label: "Material", text: "Fluted stone, oiled timber and brushed bronze, each doing one job." },
  { id: "texture", label: "Texture", text: "Looped boucle and woven linen add warmth the eye can feel." },
  { id: "proportion", label: "Proportion", text: "Dashed guides show the circles and axes that set the furniture’s position." },
];
const POSTER = { src: "/images/architecture/spatial.jpg", fallback: "/images/architecture/spatial.jpg", alt: "3D render of the studio's living room" };

function Group<T extends string>({ label, items, value, onChange }: { label: string; items: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className="eyebrow mb-3">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <button key={i.id} type="button" aria-pressed={value === i.id} onClick={() => onChange(i.id)}
            className={cn("rounded-full border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] capitalize transition-colors duration-500", value === i.id ? "border-bronze bg-bronze text-warm-white" : "border-ivory/25 hover:border-bronze")}>
            {i.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** The one place 3D earns its cost: changing light, wall, floor and focus live. Loads only on request. */
export default function SpatialExperience({ index = "04" }: { index?: string }) {
  const [light, setLight] = useState<LightMode>("natural");
  const [wall, setWall] = useState<MaterialId>("travertine");
  const [floor, setFloor] = useState<MaterialId>("walnut");
  const [focus, setFocus] = useState<Focus>("space");
  const f = FOCUSES.find((x) => x.id === focus)!;
  return (
    <section className="surface-dark" aria-labelledby="spatial-title">
      <div className="container-x section">
        <SectionHeading index={index} eyebrow="Spatial experience" title={<span id="spatial-title">Change the room. <em>Feel the difference.</em></span>} lead="Space, light, form, material, texture and proportion — switch them live in a real-time 3D room." />
        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="lg:col-span-8"><div className="relative aspect-[16/10] w-full" data-cursor="Look">
            <PosterGate poster={POSTER} label="Enter the room" hint="Loads the interactive 3D scene (about 2 MB).">
              <SpatialCanvas light={light} wall={wall} floor={floor} focus={focus} />
              <p className="pointer-events-none absolute bottom-4 left-4 max-w-xs bg-charcoal/75 p-4 text-sm backdrop-blur" aria-live="polite"><span className="eyebrow mb-1 block !text-bronze">{f.label}</span>{f.text}</p>
            </PosterGate>
          </div></Reveal>
          <Reveal className="flex flex-col gap-7 lg:col-span-4" stagger={0.08}>
            <Group label="Light" items={LIGHTS} value={light} onChange={setLight} />
            <Group label="Wall" items={WALLS.map((w) => ({ id: w, label: w }))} value={wall} onChange={setWall} />
            <Group label="Floor" items={FLOORS.map((w) => ({ id: w, label: w }))} value={floor} onChange={setFloor} />
            <Group label="Focus" items={FOCUSES} value={focus} onChange={setFocus} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
