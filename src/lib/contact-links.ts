/** Pure link/format helpers. Safe in server and client code (no config or env imports). */
import type { HoursConfig, LocationConfig } from "@/config/schema";

export const telHref = (e164: string) => `tel:${e164}`;
export const mailtoHref = (email: string, subject?: string) => `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
/** wa.me wants the number without "+" and any formatting. */
export const whatsappHref = (e164: string, message?: string) => `https://wa.me/${e164.replace(/\D/g, "")}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

const DAY_LABEL = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" } as const;
const ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/**
 * Compact day list. Ranges may wrap around the week, so the Dhaka working week reads "Sun – Thu" (not "Mon – Thu, Sun").
 * Runs of 3+ days become "A – B"; shorter runs are comma-separated. Runs are ordered Mon→Sun by their first day.
 */
export function formatDays(days: HoursConfig["days"]): string {
  const set = new Set(days.map((d) => ORDER.indexOf(d)));
  if (set.size === 7) return "Daily";
  const starts = [...set].filter((i) => !set.has((i + 6) % 7)).sort((a, b) => a - b);
  return starts
    .map((start) => {
      const run = [start];
      while (set.has((run.at(-1)! + 1) % 7) && run.length < 7) run.push((run.at(-1)! + 1) % 7);
      const label = (i: number) => DAY_LABEL[ORDER[i]];
      return run.length >= 3 ? `${label(run[0])} – ${label(run.at(-1)!)}` : run.map(label).join(", ");
    })
    .join(", ");
}

export const formatHours = (h: HoursConfig) => `${formatDays(h.days)} · ${h.opens} – ${h.closes}${h.note ? ` (${h.note})` : ""}`;

/** Street lines when they exist, otherwise the honest area-level line. */
export function formatAddress(l: Pick<LocationConfig, "addressLines" | "area" | "city" | "country" | "postalCode" | "addressNote">): string[] {
  const place = [l.area, l.city].filter(Boolean).join(", ");
  return [...l.addressLines, [place, l.postalCode].filter(Boolean).join(" "), l.country, ...(l.addressLines.length === 0 && l.addressNote ? [l.addressNote] : [])];
}
