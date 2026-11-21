import { z } from "zod";

const schema = z.object({
  kind: z.enum(["inquiry", "newsletter"]).default("inquiry"),
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(200),
  type: z.string().max(80).optional(),
  budget: z.string().max(80).optional(),
  location: z.string().max(160).optional(),
  message: z.string().trim().max(4000).optional(),
  company: z.string().max(0).optional(), // honeypot
});

// Best-effort in-memory rate limit (per server instance). Use a shared store (e.g. Upstash) for multi-instance deployments.
const hits = new Map<string, { n: number; t: number }>();
const WINDOW = 10 * 60 * 1000;
const MAX = 6;

function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > WINDOW) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n += 1;
  return h.n > MAX;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return Response.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });

  let json: unknown;
  try { json = await req.json(); } catch { return Response.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false, error: "Please check the form and try again." }, { status: 422 });
  const d = parsed.data;
  if (d.company) return Response.json({ ok: true, delivered: true }); // bot: pretend success

  const key = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO_EMAIL, from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !to || !from) {
    console.info("[contact] email delivery not configured; submission not sent", { kind: d.kind });
    return Response.json({ ok: true, delivered: false });
  }
  const subject = d.kind === "newsletter" ? "Newsletter signup" : `New project inquiry — ${d.type ?? "General"}`;
  const text = [
    `Kind: ${d.kind}`, d.name && `Name: ${d.name}`, `Email: ${d.email}`, d.type && `Project type: ${d.type}`,
    d.budget && `Budget: ${d.budget}`, d.location && `Location: ${d.location}`, d.message && `\n${d.message}`,
  ].filter(Boolean).join("\n");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, text, reply_to: d.email }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}`);
    return Response.json({ ok: true, delivered: true });
  } catch (e) {
    console.error("[contact] send failed", e);
    return Response.json({ ok: false, error: "We could not send your message. Please email us directly." }, { status: 502 });
  }
}
