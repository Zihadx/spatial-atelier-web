import { formatAddress, formatHours, mailtoHref, telHref, whatsappHref } from "@/lib/contact-links";
import { getContact, getLocations, getPhone, getPrimaryLocation, getPrimaryPhone } from "@/lib/site";

/** Contact channels and studio locations, rendered from central config. `compact` shows only the primary location. */
export default function ContactDetails({ variant = "full" }: { variant?: "compact" | "full" }) {
  const contact = getContact(), phone = getPrimaryPhone();
  const locations = variant === "compact" ? [getPrimaryLocation()] : getLocations();
  return (
    <div className="space-y-6 text-sm">
      <div><p className="eyebrow mb-2">Email</p><a className="link-u" href={mailtoHref(contact.emails.primary)}>{contact.emails.primary}</a></div>
      <div>
        <p className="eyebrow mb-2">Phone</p>
        <a className="link-u" href={telHref(phone.e164)}>{phone.display}</a>
        {contact.whatsapp && <> <span aria-hidden>·</span> <a className="link-u" href={whatsappHref(contact.whatsapp.e164, contact.whatsapp.defaultMessage)} target="_blank" rel="noopener noreferrer">WhatsApp<span className="sr-only"> (opens in a new tab)</span></a></>}
      </div>
      {locations.map((l) => (
        <div key={l.id}>
          <p className="eyebrow mb-2">{l.name}</p>
          <address className="not-italic text-muted">
            {formatAddress(l).map((line) => <span key={line} className="block">{line}</span>)}
          </address>
          <ul className="mt-2 space-y-0.5 text-muted">{l.hours.map((h) => <li key={formatHours(h)}>{formatHours(h)}</li>)}</ul>
          {l.appointmentOnly && <p className="mt-2 text-muted">Visits by appointment.</p>}
          {variant === "full" && l.phoneId && getPhone(l.phoneId).e164 !== phone.e164 && <p className="mt-2"><a className="link-u" href={telHref(getPhone(l.phoneId).e164)}>{getPhone(l.phoneId).display}</a></p>}
        </div>
      ))}
    </div>
  );
}
