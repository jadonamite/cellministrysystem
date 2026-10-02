"use client";

import { MotionConfig } from "framer-motion";

/** Honour the visitor's reduced-motion setting for every framer animation on the public site. */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
