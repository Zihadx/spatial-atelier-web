/** The brand wordmark: "Atelier <em>Verre</em>". Reads the parts from config so a rename updates every use. */
export default function Wordmark({ lead, accent, emClassName = "text-bronze" }: { lead: string; accent: string; emClassName?: string }) {
  return <>{lead} <em className={emClassName}>{accent}</em></>;
}
