"use client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { NAV } from "@/data/navigation";
import { getLenis } from "@/lib/lenis";

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => { getLenis()?.start(); document.body.style.overflow = ""; window.removeEventListener("keydown", key); };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[60] flex flex-col bg-espresso text-ivory"
          initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}>
          <div className="container-x flex items-center justify-between py-6">
            <span className="font-display text-2xl">Atelier <em className="text-bronze">Verre</em></span>
            <button ref={closeRef} type="button" onClick={onClose} className="btn btn-line !py-3" aria-label="Close menu"><X size={16} /> Close</button>
          </div>
          <ul className="container-x mt-8 flex flex-1 flex-col justify-center gap-2">
            {[{ href: "/", label: "Home" }, ...NAV].map((n, i) => (
              <motion.li key={n.href} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <Link href={n.href} onClick={onClose} className="group flex items-baseline gap-4 border-b border-ivory/10 py-3 transition-colors hover:text-bronze"><span className="num text-sm text-taupe">{String(i).padStart(2, "0")}</span><span className="display-m">{n.label}</span></Link>
              </motion.li>
            ))}
          </ul>
          <div className="container-x pb-8 text-sm text-taupe"><a href="mailto:studio@atelierverre.example" className="link-u text-ivory">studio@atelierverre.example</a><p className="mt-3">Atelier Verre — demonstration studio concept</p></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
