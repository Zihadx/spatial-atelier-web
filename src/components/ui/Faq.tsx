import { Plus } from "lucide-react";

export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-current/15 border-y border-current/15">
      {items.map((f) => (
        <details key={f.q} className="group py-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 display-s [&::-webkit-details-marker]:hidden">
            {f.q}<Plus size={20} aria-hidden className="shrink-0 transition-transform duration-500 group-open:rotate-45" />
          </summary>
          <p className="mt-4 max-w-2xl text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
