import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { getContent } from "@/content";

/** Four equal editorial role cards. No people are depicted or named until real team data is provided. */
export default async function TeamSection({ index = "10" }: { index?: string }) {
  const { team: TEAM } = await getContent().getStudio();
  return (
    <section className="surface-warm" aria-labelledby="team-title">
      <div className="container-x section">
        <SectionHeading index={index} eyebrow="Team" title={<span id="team-title">The people <em>behind the rooms.</em></span>} lead="The designers, architects and stylists who carry each project from first brief to handover." />
        <Reveal stagger={0.1} as="ul" className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((t) => (
            <li key={t.role}>
              <div className="frame frame-portrait">
                <Image src={`/images/materials/${t.tone}.jpg`} alt="" fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" aria-hidden />
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
