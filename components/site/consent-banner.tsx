"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "cm-cookie-notice";

/**
 * Every cookie the app sets is functional and only set after sign-in, with no
 * tracking, so this is a notice to acknowledge rather than a choice to make.
 */
const noop = () => () => {};

function readSeen() {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export function ConsentBanner() {
  // the server renders it closed; the browser opens it until the notice is acknowledged
  const seen = useSyncExternalStore(noop, readSeen, () => true);
  const [dismissed, setDismissed] = useState(false);
  const open = !seen && !dismissed;

  function dismiss() {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {}
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="region"
          aria-label="Cookie notice"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: 16, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
          className="fixed inset-x-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-3xl bg-popover p-5 text-popover-foreground shadow-[var(--lift-3)] ring-1 ring-border sm:left-auto sm:right-8 sm:mx-0"
        >
          <p className="text-[0.9375rem] leading-[1.45]">
            Cookies here are only set when a leader signs in, to keep them signed in and remember
            their settings. No tracking, no ads.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-[0.9375rem] font-semibold text-primary-foreground transition-opacity duration-150 hover:opacity-90"
            >
              Got it
            </button>
            <Link
              href="/cookies"
              className="inline-flex min-h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium text-label-2 hover:text-foreground"
            >
              Cookie policy
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
