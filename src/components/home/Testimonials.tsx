"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import type { Testimonial } from "@/content";

export default function Testimonials({ index = "11", items: TESTIMONIALS }: { index?: string; items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const n = TESTIMONIALS.length;
  const t = TESTIMONIALS[i];
  const btn = "flex h-12 w-12 items-center justify-center rounded-full border border-espresso/30 transition-colors duration-500 hover:bg-espresso hover:text-ivory";
  return (
    <section className="surface-sand" aria-label="Testimonials">
      <div className="container-x section">
        <SectionLabel index={index} label="Kind words" />
        <div className="min-h-[13rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.blockquote key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <p className="display-m max-w-[28ch]">&ldquo;{t.quote}&rdquo;</p>
              <footer className="eyebrow mt-6">{t.by}</footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <button type="button" aria-label="Previous testimonial" onClick={() => setI((i + n - 1) % n)} className={btn}><ArrowLeft size={16} /></button>
          <button type="button" aria-label="Next testimonial" onClick={() => setI((i + 1) % n)} className={btn}><ArrowRight size={16} /></button>
          <span className="num ml-3 text-sm">{i + 1} / {n}</span>
        </div>
        {TESTIMONIALS.some((x) => x.isMock) && <p className="mt-8 text-xs text-espresso/80">Illustrative testimonials — not verified client feedback.</p>}
      </div>
    </section>
  );
}
