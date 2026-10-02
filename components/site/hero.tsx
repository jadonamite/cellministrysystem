"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import stage from "@/public/images/zoneg/live/hero-stage.jpg";
import crowd from "@/public/images/zoneg/live/hero-crowd.png";
import { HeroNav } from "./section-nav";

const ARRIVE = [0.22, 1, 0.36, 1] as const;
const WORDS = ["Giving", "your", "life", "a"];

// both layers crop and scale identically (CSS scale 1.06, bottom origin), so the
// cut-out crowd sits exactly on its own pixels until scrolling separates them
const CROP = "object-cover object-[50%_62%]";

/**
 * Three planes of one photograph. The stage is furthest away and moves least;
 * the statement floats in the middle; the crowd, cut out of the same frame,
 * is nearest and moves with the page. Scrolling (and, on desktop, the
 * pointer) separates the planes.
 */
export function Hero() {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // scroll depth: far plane lags, middle plane lags less, near plane is the page
  const stageY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const wordsY = useTransform(scrollYProgress, [0, 1], ["0%", "70%"]);
  const wordsFade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const crowdY = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const shade = useTransform(scrollYProgress, [0, 1], [0, 0.6]);

  // pointer depth, desktop only
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 70, damping: 20 });
  const py = useSpring(my, { stiffness: 70, damping: 20 });
  const stageX = useTransform(px, (v) => v * -10);
  const crowdX = useTransform(px, (v) => v * 18);
  const crowdTilt = useTransform(py, (v) => v * 6);

  function onPointerMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }

  return (
    <header
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-midnight text-cream"
    >
      {/* far plane: the stage */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: stageY, scale: stageScale, x: stageX }}
        className="absolute inset-0 -z-30 origin-bottom scale-[1.06]"
      >
        <Image src={stage} alt="" fill priority placeholder="blur" sizes="100vw" className={CROP} />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(120%_70%_at_50%_30%,rgb(7_11_36/0.5)_0%,rgb(7_11_36/0.78)_70%),linear-gradient(180deg,rgb(7_11_36/0.55)_0%,rgb(7_11_36/0.15)_45%,rgb(7_11_36/0.2)_100%)]"
      />

      {/* middle plane: the statement, set behind the crowd's raised hands */}
      <motion.div
        style={reduce ? undefined : { y: wordsY, opacity: wordsFade }}
        className="absolute inset-x-0 top-[46svh] -z-10 flex justify-center px-4 sm:top-[25svh] sm:px-10"
      >
        <h1 className="display max-w-[13ch] text-center text-[clamp(3.25rem,10vw,8.5rem)] leading-[0.92] text-cream [text-shadow:0_2px_30px_rgb(7_11_36/0.45)]">
          {WORDS.map((w, i) => (
            <motion.span
              key={w}
              initial={reduce ? false : { opacity: 0, y: "0.4em", filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: ARRIVE }}
              className="inline-block"
            >
              {w}&nbsp;
            </motion.span>
          ))}
          <motion.span
            initial={reduce ? false : { opacity: 0, y: "0.4em", filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.45, ease: ARRIVE }}
            className="serif-highlight inline-block text-[1.08em] leading-[0.8] text-highlight"
          >
            meaning.
          </motion.span>
        </h1>
      </motion.div>

      {/* near plane: the crowd */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: crowdY, x: crowdX, rotate: crowdTilt }}
        className="pointer-events-none absolute inset-0 origin-bottom"
      >
        <motion.div
          initial={reduce ? false : { y: "8%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease: ARRIVE }}
          className="absolute inset-0 origin-bottom scale-[1.06]"
        >
          <Image src={crowd} alt="" fill priority sizes="100vw" className={CROP} />
        </motion.div>
      </motion.div>

      {/* the page darkens as the hero leaves, so Join us rises out of shadow */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { opacity: shade }}
        className="pointer-events-none absolute inset-0 bg-midnight opacity-0"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-midnight via-midnight/70 to-transparent" />

      <div className="relative mt-auto">
        <HeroNav />
      </div>
    </header>
  );
}
