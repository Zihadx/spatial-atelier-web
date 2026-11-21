import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";

const MODELS = [
  { n: "I", t: "Consultation", for: "One room, a renovation question, or a second opinion.", inc: ["Site visit or video walk-through", "Written direction and material guidance", "Phased roadmap you can act on"] },
  { n: "II", t: "Design", for: "A home or space ready to be fully designed.", inc: ["Concept, plans and 3D previews", "Material boards and full specification", "Joinery and lighting drawings"] },
  { n: "III", t: "Full service", for: "Design carried all the way to handover.", inc: ["Everything in Design", "Procurement and trade coordination", "Site supervision, styling and handover"] },
];

export default function Engagement({ index = "10" }: { index?: string }) {
  return (
    <section className="surface-warm" aria-labelledby="eng-title">
      <div className="container-x section">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <SectionHeading index={index} eyebrow="Ways to work together" title={<span id="eng-title">Three ways in, <em>one standard.</em></span>} />
          <Button href="/contact" variant="dark">Discuss your project</Button>
        </div>
        <Reveal as="ul" stagger={0.12} className="grid gap-px bg-espresso/15 md:grid-cols-3">
          {MODELS.map((m) => (
            <li key={m.t} className="flex flex-col bg-warm-white p-8 md:p-10">
              <span className="num text-5xl text-bronze">{m.n}</span>
              <h3 className="display-m mt-6">{m.t}</h3>
              <p className="mt-3 text-sm text-muted">{m.for}</p>
              <ul className="mt-8 space-y-3 border-t border-espresso/15 pt-6 text-sm">{m.inc.map((x) => <li key={x} className="flex gap-3"><span className="text-bronze">—</span>{x}</li>)}</ul>
              <p className="eyebrow mt-auto pt-8">Fee — discussed per project</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
