"use client";

import { motion, MotionConfig } from "framer-motion";
import { softSpring } from "@/lib/motion";

/**
 * Wraps every route. Fades content on navigation and sets the app-wide
 * reduced-motion policy. Deliberately OPACITY-ONLY: a transform here would
 * become the containing block for the pages' `position: sticky` bars and break
 * them, so we never translate at this level.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...softSpring, opacity: { duration: 0.12 } }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
