"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function NewsletterForm() {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "unconfigured" | "error">("idle");
  const [email, setEmail] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setState("error"); return; }
    setState("busy");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "newsletter", email }) });
      const j = (await r.json()) as { ok: boolean; delivered?: boolean };
      setState(!r.ok || !j.ok ? "error" : j.delivered ? "ok" : "unconfigured");
      if (r.ok && j.ok) setEmail("");
    } catch { setState("error"); }
  };
  return (
    <form onSubmit={submit} noValidate aria-label="Journal newsletter" className="max-w-md">
      <label htmlFor="nl-email" className="eyebrow mb-3 block">The Journal, occasionally</label>
      <div className="flex items-center border-b border-ivory/40 focus-within:border-bronze">
        <input id="nl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" autoComplete="email" className="w-full bg-transparent py-3 text-base text-ivory placeholder:text-taupe focus:outline-none" />
        <button type="submit" disabled={state === "busy"} aria-label="Subscribe" className="p-3 transition-colors hover:text-bronze disabled:opacity-50"><ArrowRight size={18} /></button>
      </div>
      <p role="status" className="mt-3 min-h-5 text-xs text-taupe">
        {state === "ok" && "Thank you — you are on the list."}
        {state === "unconfigured" && "Subscriptions are not set up on this site yet."}
        {state === "error" && "Please enter a valid email and try again."}
      </p>
    </form>
  );
}
