"use client";
import "@/lib/zod-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email address"),
  type: z.string().min(1, "Choose a project type"),
  budget: z.string().min(1, "Choose a budget range"),
  location: z.string().min(2, "Where is the project?"),
  message: z.string().min(20, "Tell us a little more (at least 20 characters)"),
  company: z.string().max(0).optional(),
});
type Values = z.infer<typeof schema>;

type Status = { kind: "idle" } | { kind: "sent" } | { kind: "unconfigured" } | { kind: "error"; msg: string };

interface Props { dark?: boolean; projectTypes: string[]; budgetRanges: { value: string; label: string }[]; fallbackEmail: string }

/** Validated inquiry form posting to /api/contact (contract: API_CONTRACTS.md). Options and fallback email come from config via props. */
export default function ContactForm({ dark = false, projectTypes, budgetRanges, fallbackEmail }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { type: projectTypes[0], budget: budgetRanges[0].label },
  });
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const onSubmit = async (v: Values) => {
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...v, kind: "inquiry" }) });
      const j = (await res.json()) as { ok: boolean; delivered?: boolean; error?: string; code?: string };
      if (!res.ok || !j.ok) { setStatus({ kind: "error", msg: j.error ?? "Something went wrong. Please try again." }); return; }
      setStatus({ kind: j.delivered ? "sent" : "unconfigured" });
      reset();
    } catch { setStatus({ kind: "error", msg: "Network error. Please try again." }); }
  };
  const err = (k: keyof Values) => errors[k] && <span id={`${k}-err`} role="alert" className="error">{errors[k]?.message}</span>;
  const common = (k: keyof Values) => ({ ...register(k), "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-err` : undefined });
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className={dark ? "surface-dark p-8 md:p-12" : ""} aria-label="Project inquiry">
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        <div className="field"><label htmlFor="name">Name</label><input id="name" autoComplete="name" {...common("name")} />{err("name")}</div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" {...common("email")} />{err("email")}</div>
        <div className="field"><label htmlFor="type">Project type</label><select id="type" {...common("type")}>{projectTypes.map((t) => <option key={t}>{t}</option>)}</select>{err("type")}</div>
        <div className="field"><label htmlFor="budget">Budget range</label><select id="budget" {...common("budget")}>{budgetRanges.map((b) => <option key={b.value} value={b.label}>{b.label}</option>)}</select>{err("budget")}</div>
        <div className="field md:col-span-2"><label htmlFor="location">Project location</label><input id="location" autoComplete="address-level2" {...common("location")} />{err("location")}</div>
        <div className="field md:col-span-2"><label htmlFor="message">About the space</label><textarea id="message" rows={4} {...common("message")} />{err("message")}</div>
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden"><label htmlFor="company">Company</label><input id="company" tabIndex={-1} autoComplete="off" {...register("company")} /></div>
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <button type="submit" disabled={isSubmitting} className={`btn ${dark ? "btn-solid" : "btn-dark"} disabled:opacity-60`}>{isSubmitting ? "Sending…" : "Request a consultation"} <ArrowRight size={16} aria-hidden /></button>
        <p role="status" className="max-w-sm text-sm text-muted">
          {status.kind === "sent" && "Thank you — your message is with the studio. We will reply by email."}
          {status.kind === "unconfigured" && <>We could not deliver your message automatically. Please write to <a className="underline" href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>.</>}
          {status.kind === "error" && status.msg}
          {status.kind === "idle" && "We reply to every inquiry personally."}
        </p>
      </div>
    </form>
  );
}
