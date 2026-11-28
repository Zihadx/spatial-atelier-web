import type { ContactPayload } from "@/lib/contact-schema";

/** Removes control characters (incl. CR/LF) so user input can never inject mail headers or forge extra lines. */
export const oneLine = (s: string, max = 200) => s.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").trim().slice(0, max);

export interface OutgoingMessage { subject: string; text: string; replyTo: string }

export function buildMessage(d: ContactPayload, brandName: string): OutgoingMessage {
  const subject = d.kind === "newsletter" ? `${brandName}: newsletter signup` : `${brandName}: new project inquiry — ${oneLine(d.type ?? "General", 80)}`;
  const lines = [
    `Kind: ${d.kind}`,
    d.name && `Name: ${oneLine(d.name, 120)}`,
    `Email: ${oneLine(d.email)}`,
    d.type && `Project type: ${oneLine(d.type, 80)}`,
    d.budget && `Budget: ${oneLine(d.budget, 80)}`,
    d.location && `Location: ${oneLine(d.location, 160)}`,
    d.message && `\n${d.message.replace(/\r\n?/g, "\n")}`,
  ].filter(Boolean) as string[];
  return { subject: oneLine(subject, 200), text: lines.join("\n"), replyTo: oneLine(d.email) };
}
