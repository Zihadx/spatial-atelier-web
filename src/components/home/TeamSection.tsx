import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { TEAM } from "@/data/studio";

/** Four equal editorial portraits (placeholders, clearly labelled — no real people are depicted). */
export default function TeamSection({ index = "10" }: { index?: string }) {
  return (
    <section className="surface-warm" aria-labelledby="team-title">
      <div className="container-x section">
        <SectionHeading index={index} eyebrow="Team" title={<span id="team-title">The people <em>behind the rooms.</em></span>} lead="Placeholder profiles — replace with the studio’s real team and photography." />
        <Reveal stagger={0.1} as="ul" className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((t) => (
            <li key={t.role}>
              <div className="frame frame-portrait">
                <Image src={`/images/materials/${t.tone}.jpg`} alt="" fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" aria-hidden />
                <span className="absolute inset-x-0 bottom-0 bg-charcoal/75 px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-ivory">Placeholder profile</span>
              </div>
              <h3 className="display-s mt-4">{t.role}</h3>
              <p className="mt-1.5 text-sm text-muted">{t.note}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
