"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Wordmark } from "./cell-mark";

export const SECTIONS = [
  { id: "join-us", label: "Join us" },
  { id: "excerpts", label: "Excerpts" },
  { id: "listen-in", label: "Listen in" },
  { id: "live-event", label: "Live event" },
  { id: "gallery", label: "Gallery" },
] as const;

/**
 * The bar along the bottom of the hero: wordmark, then the section pills on clear
 * glass. Once it scrolls away, a copy on regular glass docks at the bottom of
 * the screen and marks the current section.
 */
const noop = () => () => {};

export function HeroNav() {
  const bar = useRef<HTMLElement>(null);
  const [docked, setDocked] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  // false during SSR, true in the browser: the portal target only exists client-side
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setDocked(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <nav
        ref={bar}
        aria-label="Sections"
        className="flex flex-col gap-5 px-4 pt-5 pb-[max(24px,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:pb-10"
      >
        <Link href="/" aria-label="BLWZONEG home" className="inline-flex min-h-11 items-center self-start sm:self-auto">
          <Wordmark />
        </Link>
        <div className="glass-clear max-w-full self-start rounded-full p-1.5 sm:self-auto">
          <Pills active={active} tone="clear" />
        </div>
      </nav>

      {mounted &&
        createPortal(
          // portalled: the hero isolates its stacking context, which would trap this under later sections
          <AnimatePresence>
            {docked && (
              <motion.nav
                aria-label="Sections"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, y: 32, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
                className="fixed inset-x-0 bottom-[max(14px,env(safe-area-inset-bottom))] z-40 flex justify-center px-3"
              >
                <div className="glass-regular max-w-full rounded-full p-1.5">
                  <Pills active={active} tone="regular" />
                </div>
              </motion.nav>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function Pills({ active, tone }: { active: string | null; tone: "clear" | "regular" }) {
  const clear = tone === "clear";
  return (
    <ul className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
      {SECTIONS.map((s) => {
        const current = active === s.id;
        return (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              aria-current={current ? "location" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-4 text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-150",
                clear
                  ? "text-white hover:bg-white/15"
                  : current
                    ? "bg-ink text-cream"
                    : "text-ink hover:bg-ink/[0.06]",
              )}
            >
              {s.label}
            </a>
          </li>
        );
      })}
      <li className={cn("shrink-0", !clear && "hidden sm:block")}>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-full bg-highlight px-5 text-[0.9375rem] font-semibold whitespace-nowrap text-highlight-foreground transition-opacity duration-150 hover:opacity-90"
        >
          Sign in
        </Link>
      </li>
    </ul>
  );
}
