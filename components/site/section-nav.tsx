"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Wordmark } from "./cell-mark";

export const SECTIONS = [
  { id: "join-us", label: "Join us" },
  { id: "listen-in", label: "Listen in" },
  { id: "live-event", label: "Live event" },
  { id: "gallery", label: "Gallery" },
] as const;

/**
 * The bar along the bottom of the hero: wordmark, then the section keys set in a
 * console. Once it scrolls away, a floating console docks at the bottom of the
 * screen. The current section's key has its lamp lit.
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
        <div className="console max-w-full self-start p-2 sm:self-auto">
          <Keys active={active} />
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
                <div className="console max-w-full p-2">
                  <Keys active={active} docked />
                </div>
              </motion.nav>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function Keys({ active, docked }: { active: string | null; docked?: boolean }) {
  return (
    <ul className="flex items-center gap-2 overflow-x-auto px-0.5 pt-0.5 pb-1.5 [scrollbar-width:none] sm:gap-2.5">
      {SECTIONS.map((s) => {
        const current = active === s.id;
        return (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              aria-current={current ? "location" : undefined}
              className="key px-3.5 text-[0.9375rem] font-medium whitespace-nowrap sm:px-[1.125rem]"
            >
              <span aria-hidden className="key-lamp" />
              {s.label}
            </a>
          </li>
        );
      })}
      <li className={cn("shrink-0", docked && "hidden sm:block")}>
        <Link href="/login" className="key key-gold px-4 text-[0.9375rem] font-semibold whitespace-nowrap sm:px-5">
          Sign in
        </Link>
      </li>
    </ul>
  );
}
