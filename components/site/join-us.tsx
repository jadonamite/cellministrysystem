"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import badge from "@/public/images/blw-badge.png";
import { cn } from "@/lib/utils";
import { SERVICES, VENUE, type Service } from "@/lib/site-content";
import { FlyerButton } from "./flyer-button";

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=BLW+Auditorium+FUTA+Southgate+Akure";

/**
 * A pinned horizontal run. The section holds still while vertical scrolling
 * slides a row of service panels sideways; inside each panel the photo drifts
 * the other way. With reduced motion it is a plain swipeable row.
 */
export function JoinUs() {
  const reduce = useReducedMotionSafe();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(progress, (p) => -p * distance);
  const drift = useTransform(progress, [0, 1], ["6%", "-6%"]);

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

  // keyboard users: a focused panel scrolls the page until the panel is on screen
  function onFocus(e: React.FocusEvent<HTMLUListElement>) {
    const s = section.current;
    const li = (e.target as HTMLElement).closest("li");
    if (reduce || !s || !li || !distance) return;
    const left = li.offsetLeft - (window.innerWidth - li.offsetWidth) / 2;
    const p = Math.min(1, Math.max(0, left / distance));
    window.scrollTo({ top: s.offsetTop + p * distance, behavior: "instant" });
  }

  const panels = (
    <>
      <li className="flex w-[min(84vw,30rem)] shrink-0 flex-col justify-center pr-4 sm:pr-10">
        <div className="flex items-center gap-3">
          <Image src={badge} alt="" width={48} height={48} className="size-12 rounded-full ring-2 ring-highlight/40" />
          <p className="text-[0.9375rem] leading-tight font-semibold">
            Believers&apos; LoveWorld
            <span className="block font-normal text-cream/70">Campus Ministry, Zone G</span>
          </p>
        </div>
        <h2 className="display mt-8 text-[clamp(3rem,8vw,6.25rem)] uppercase">
          Come <span className="serif-highlight normal-case text-highlight">worship</span>
          <span className="block">with us</span>
        </h2>
        <p className="mt-6 max-w-[26ch] text-[1.0625rem] leading-[1.5] text-cream/75">
          Four ways to be in the room, all at BLW Auditorium, FUTA Southgate.
        </p>
      </li>

      {SERVICES.map((s, i) => (
        <ServicePanel key={s.title.join(" ")} service={s} index={i} drift={reduce ? undefined : drift} />
      ))}

      <li className="relative h-[min(72svh,38rem)] w-[min(90vw,46rem)] shrink-0 snap-center overflow-hidden rounded-[32px] bg-midnight-2">
        <motion.div style={reduce ? undefined : { x: drift }} className="absolute -inset-x-[8%] inset-y-0">
          <Image src={VENUE.photo} alt={VENUE.photoAlt} fill sizes="(min-width: 768px) 50rem, 100vw" className="object-cover" />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_11_36/0.15)_0%,rgb(7_11_36/0.35)_45%,rgb(7_11_36/0.92)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-6 sm:p-9">
          <p className="text-[0.8125rem] font-semibold tracking-[0.08em] text-cream/70 uppercase">The venue</p>
          <p className="display text-[clamp(2.25rem,5vw,4rem)] uppercase">
            BLW <span className="text-highlight">Auditorium</span>
          </p>
          <p className="max-w-[34ch] text-[1.0625rem] leading-[1.45] text-cream/85">{VENUE.address}</p>
          <a href={MAPS_URL} target="_blank" rel="noreferrer" className="key key-gold self-start px-5 text-[0.9375rem] font-semibold">
            Get directions
          </a>
        </div>
      </li>
    </>
  );

  if (reduce) {
    return (
      <section id="join-us" ref={section} className="scroll-mt-4 bg-midnight py-24 text-cream">
        <ul className="flex snap-x snap-mandatory items-center gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-10">
          {panels}
        </ul>
      </section>
    );
  }

  return (
    <section
      id="join-us"
      ref={section}
      style={{ height: `calc(100svh + ${distance}px)` }}
      className="relative bg-midnight text-cream"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgb(30_64_216/0.35)_0%,transparent_70%),radial-gradient(40%_40%_at_90%_100%,rgb(194_24_122/0.18)_0%,transparent_70%)]"
        />
        <motion.ul
          ref={track}
          onFocus={onFocus}
          style={{ x }}
          className="relative flex w-max items-center gap-5 px-4 sm:gap-7 sm:px-10"
        >
          {panels}
        </motion.ul>

        <div aria-hidden className="absolute inset-x-4 bottom-[max(96px,calc(env(safe-area-inset-bottom)+88px))] h-[3px] overflow-hidden rounded-full bg-cream/10 sm:inset-x-10">
          <motion.div style={{ scaleX: progress }} className="h-full origin-left rounded-full bg-highlight" />
        </div>
      </div>
    </section>
  );
}

function ServicePanel({ service: s, index, drift }: { service: Service; index: number; drift?: MotionValue<string> }) {
  return (
    <li
      className={cn(
        "relative h-[min(72svh,38rem)] w-[min(78vw,27rem)] shrink-0 snap-center overflow-hidden rounded-[32px] bg-midnight-2 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)]",
        index % 2 === 1 && "sm:translate-y-8",
      )}
    >
      <motion.div style={drift ? { x: drift } : undefined} className="absolute -inset-x-[10%] inset-y-0">
        <Photo src={s.photo} alt={s.photoAlt} />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_11_36/0)_30%,rgb(7_11_36/0.55)_60%,rgb(7_11_36/0.94)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:p-7">
        <p className="self-start rounded-full bg-cream/12 px-3.5 py-1.5 text-[0.875rem] font-semibold text-cream ring-1 ring-cream/20 backdrop-blur-md">
          {s.when}
          {s.placeholder && <span className="font-normal text-cream/70"> · time to be confirmed</span>}
        </p>
        <h3 className="display text-[clamp(2.5rem,6vw,3.75rem)] uppercase">
          <span className="text-highlight">{s.title[0]}</span>
          <span className="block">{s.title[1]}</span>
        </h3>
        <FlyerButton photo={s.flyer} alt={s.flyerAlt} title={s.title.join(" ")} textLabel className="key self-start rounded-[14px] px-4 text-[0.9375rem] font-medium hover:scale-100 active:scale-100">
          View flyer<span className="sr-only"> for {s.title.join(" ")}</span>
        </FlyerButton>
      </div>
    </li>
  );
}

function Photo({ src, alt }: { src: StaticImageData; alt: string }) {
  return <Image src={src} alt={alt} fill sizes="(min-width: 640px) 30rem, 90vw" className="object-cover object-top" />;
}
