"use client";
import { motion } from "motion/react";

/** Gentle enter transition for every route (Motion handles interface transitions; GSAP owns scroll choreography). */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div data-page initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}
