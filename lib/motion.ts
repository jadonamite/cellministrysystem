import type { Variants, Transition } from "framer-motion";

/**
 * Shared motion vocabulary so the whole app moves with one physics. Tune here,
 * not per-component. Framer Motion already honours `prefers-reduced-motion`
 * globally via <MotionConfig reducedMotion="user"> in the layout.
 */

export const spring: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 };
export const softSpring: Transition = { type: "spring", stiffness: 260, damping: 28 };
export const snappy: Transition = { type: "spring", stiffness: 600, damping: 30 };

/** Fade + rise — the default entrance for cards and rows. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: spring },
};

/** Parent that staggers its children's entrances. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
};

/** Dialog step transitions (progressive call flow). Direction via custom prop. */
export const stepVariants: Variants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0, transition: spring },
  exit: { opacity: 0, x: -24, transition: { duration: 0.15 } },
};

/** Page-level route transition. */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { ...softSpring, staggerChildren: 0.05 } },
};
