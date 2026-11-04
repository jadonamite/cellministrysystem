"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { CELL_MEETINGS, VENUE, WORSHIP } from "@/lib/site-content";
import { FlyerButton } from "./flyer-button";

/**
 * The zone's own flyers, whole and uncropped, in a pinned horizontal run: the
 * section holds still while vertical scrolling slides the row sideways. With
 * reduced motion it is a plain swipeable row.
 */
export function JoinUs() {
  const reduce = useReducedMotionSafe();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(progress, (p) => -p * distance);

  useEffect(() => {
    const el = track.current;
    if (!el || reduce) return;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduce]);

  // keyboard users: a focused flyer scrolls the page until it is on screen
  function onFocus(e: React.FocusEvent<HTMLUListElement>) {
    const s = section.current;
    const li = (e.target as HTMLElement).closest("li");
    if (reduce || !s || !li || !distance) return;
    const left = li.offsetLeft - (window.innerWidth - li.offsetWidth) / 2;
    window.scrollTo({ top: s.offsetTop + Math.min(1, Math.max(0, left / distance)) * distance, behavior: "instant" });
  }

  const items = (
    <>
      <li className="flex w-[min(84vw,26rem)] shrink-0 flex-col justify-center pr-2 sm:pr-8">
        <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-ink/70 uppercase">Join us</p>
        <h2 className="display mt-4 text-[clamp(2.75rem,6.5vw,5.25rem)]">
          Come <span className="serif-highlight text-ink">worship</span> with us
        </h2>
        <p className="mt-5 max-w-[30ch] text-[1.0625rem] leading-[1.5] text-ink/75">
          Sunday and Wednesday services are held at {VENUE.name}, {VENUE.address.split(", ").slice(0, 3).join(", ")}.
        </p>
        <p className="mt-3 text-[0.9375rem] text-ink/70">
          Cell meetings: {CELL_MEETINGS.when}
          {CELL_MEETINGS.placeholder && ", time to be confirmed"}.
        </p>
      </li>

      {WORSHIP.map((f) => (
        <li key={f.title} className="shrink-0 snap-center">
          <FlyerButton
            photo={f.flyer}
            alt={f.alt}
            title={f.title}
            className="group block rounded-[24px] focus:outline-none"
          >
            <Image
              src={f.flyer}
              alt={f.alt}
              sizes="(min-width: 640px) 26rem, 75vw"
              className="h-[min(56svh,32rem)] w-auto rounded-[24px] flyer-3d flyer-3d-hover border border-black/[0.08]"
            />
          </FlyerButton>
          <p className="mt-4 text-[1.0625rem] leading-tight font-semibold">{f.title}</p>
          <p className="mt-1 text-[0.9375rem] text-ink/70">{f.when}</p>
        </li>
      ))}

      <li className="card-3d card-3d-hover flex h-[min(56svh,32rem)] w-[min(80vw,22rem)] shrink-0 snap-center flex-col justify-end rounded-[28px] p-8">
        <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-ink/70 uppercase">The venue</p>
        <p className="display mt-3 text-[2.5rem]">{VENUE.name}</p>
        <p className="mt-3 text-[1rem] leading-[1.45] text-ink/75">{VENUE.address}</p>
        <a
          href={VENUE.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex min-h-11 items-center self-start rounded-full bg-ink px-5 text-[0.9375rem] font-semibold text-white shadow-md transition-all duration-150 hover:bg-black hover:scale-105 active:scale-95"
        >
          Get directions
        </a>
      </li>
    </>
  );

  if (reduce) {
    return (
      <section id="join-us" ref={section} className="scroll-mt-4 bg-cream py-24 text-ink">
        <ul className="flex snap-x snap-mandatory items-end gap-6 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-10">
          {items}
        </ul>
      </section>
    );
  }

  return (
    <section
      id="join-us"
      ref={section}
      style={{ height: `calc(100svh + ${distance}px)` }}
      className="relative bg-cream text-ink"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <motion.ul ref={track} onFocus={onFocus} style={{ x }} className="flex w-max items-end gap-6 px-4 sm:gap-8 sm:px-10">
          {items}
        </motion.ul>
        <div aria-hidden className="absolute inset-x-4 bottom-[max(100px,calc(env(safe-area-inset-bottom)+92px))] h-[3px] overflow-hidden rounded-full bg-ink/10 sm:inset-x-10">
          <motion.div style={{ scaleX: progress }} className="h-full origin-left rounded-full bg-ink" />
        </div>
      </div>
    </section>
  );
}
