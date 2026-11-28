import type { OutgoingMessage } from "./message";

/** Sends a message to the studio. Implementations throw on failure. */
export interface Mailer { send(msg: OutgoingMessage & { to: string; from: string }): Promise<void> }

/**
 * Persists a lead so it survives mail outages (database, CRM, queue…). None is bundled: a database needs real infrastructure.
 * Implement this interface and pass it to the contact service — see ARCHITECTURE.md.
 */
export interface LeadStore { save(lead: { id: string; receivedAt: string; kind: string; payload: unknown }): Promise<void> }

export function createResendMailer(apiKey: string, fetchImpl: typeof fetch = fetch): Mailer {
  return {
    async send({ to, from, subject, text, replyTo }) {
      const res = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject, text, reply_to: replyTo }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`mail provider responded ${res.status}`);
    },
  };
}
