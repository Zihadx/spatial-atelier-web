import RevealText from "./RevealText";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";
import { cn } from "@/lib/utils";

interface Props {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  size?: "xl" | "l" | "m";
  className?: string;
  as?: "h1" | "h2";
}

export default function SectionHeading({ index = "—", eyebrow, title, lead, size = "l", className, as = "h2" }: Props) {
  return (
    <div className={className}>
      <SectionLabel index={index} label={eyebrow} />
      <RevealText as={as} className={cn(`display-${size}`)}>{title}</RevealText>
      {lead && <Reveal y={20} delay={0.15}><p className="lead mt-6">{lead}</p></Reveal>}
    </div>
  );
}
