import { describe, expect, it } from "vitest";
import { formatAddress, formatDays, formatHours, mailtoHref, telHref, whatsappHref } from "@/lib/contact-links";

describe("contact link helpers", () => {
  it("builds tel, mailto and WhatsApp links", () => {
    expect(telHref("+8801304610108")).toBe("tel:+8801304610108");
    expect(mailtoHref("a@b.co")).toBe("mailto:a@b.co");
    expect(mailtoHref("a@b.co", "Hello there")).toBe("mailto:a@b.co?subject=Hello%20there");
    expect(whatsappHref("+8801304610108")).toBe("https://wa.me/8801304610108");
    expect(whatsappHref("+8801304610108", "Hi & bye")).toBe("https://wa.me/8801304610108?text=Hi%20%26%20bye");
  });

  it("formats day ranges", () => {
    expect(formatDays(["sun", "mon", "tue", "wed", "thu"])).toBe("Sun – Thu");
    expect(formatDays(["sat", "sun", "mon", "tue", "wed", "thu"])).toBe("Sat – Thu");
    expect(formatDays(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])).toBe("Daily");
    expect(formatDays(["sat", "sun"])).toBe("Sat, Sun");
    expect(formatDays(["mon", "tue", "wed"])).toBe("Mon – Wed");
    expect(formatDays(["sat"])).toBe("Sat");
    expect(formatDays(["sat", "mon"])).toBe("Mon, Sat");
  });

  it("formats opening hours with notes", () => {
    expect(formatHours({ days: ["sat"], opens: "11:00", closes: "15:00", note: "By appointment" })).toBe("Sat · 11:00 – 15:00 (By appointment)");
  });

  it("shows an area-level address plus the note when there are no street lines", () => {
    const lines = formatAddress({ addressLines: [], area: "Gulshan", city: "Dhaka", country: "Bangladesh", addressNote: "Exact address shared when you book a visit." });
    expect(lines).toEqual(["Gulshan, Dhaka", "Bangladesh", "Exact address shared when you book a visit."]);
  });

  it("shows street lines and omits the note once a real address exists", () => {
    const lines = formatAddress({ addressLines: ["12 Example Road"], area: "Gulshan", city: "Dhaka", country: "Bangladesh", postalCode: "1212", addressNote: "ignored" });
    expect(lines).toEqual(["12 Example Road", "Gulshan, Dhaka 1212", "Bangladesh"]);
  });
});
