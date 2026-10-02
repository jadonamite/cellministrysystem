"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Reduced-motion preference that is safe to branch markup on. The server
 * cannot know the setting, so hydration uses `false` and React re-renders
 * with the real value straight after, instead of throwing a mismatch the way
 * framer-motion's `useReducedMotion` does when the answer changes the tree.
 */
export function useReducedMotionSafe() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
