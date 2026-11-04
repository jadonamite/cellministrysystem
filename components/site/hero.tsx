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
import { HeroNav } from "./section-nav";

const ARRIVE = [0.22, 1, 0.36, 1] as const;
const WORDS = ["Giving", "your", "life", "a"];
const CROP = "object-cover object-[50%_48%]";

/**
 * Immersive multi-plane hero:
 * Far plane: the lit auditorium stage, drifting with mouse and scroll.
 * Atmosphere: deep dark obsidian vignette with radial stage glow.
 * Typography: bold display statement floating in 3D depth.
 * Bottom transition: seamless gradient flowing dark into the light sections below.
 */
export function Hero() {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Scroll depth transformations
  const stageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);
  const wordsY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const wordsFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Pointer depth (desktop only, spring dampened)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 22 });
  const py = useSpring(my, { stiffness: 60, damping: 22 });
  const stageX = useTransform(px, (v) => v * -12);
  const stageTilt = useTransform(py, (v) => v * -4);
  const wordsX = useTransform(px, (v) => v * 8);

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
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-midnight text-white"
    >
      {/* Far plane: auditorium stage photo with parallax */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: stageY, scale: stageScale, x: stageX, rotate: stageTilt }}
        className="absolute inset-0 -z-30 origin-center"
      >
        <Image
          src={stage}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className={CROP}
        />
      </motion.div>

      {/* Atmospheric lighting: obsidian grading + stage glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_110%_80%_at_50%_35%,rgb(7_10_18/0.45)_0%,rgb(7_10_18/0.82)_75%),linear-gradient(180deg,rgb(7_10_18/0.75)_0%,rgb(7_10_18/0.25)_40%,rgb(7_10_18/0.65)_85%,var(--color-cream)_100%)]"
      />

      {/* Floating middle plane: commanding headline */}
      <motion.div
        style={reduce ? undefined : { y: wordsY, x: wordsX, opacity: wordsFade }}
        className="px-4 pt-[max(14svh,calc(env(safe-area-inset-top)+72px))] text-center sm:px-10 sm:pt-[12svh]"
      >
        <h1 className="display mx-auto max-w-[15ch] text-[clamp(3.25rem,9vw,8rem)] leading-[0.92] text-white [text-shadow:0_4px_36px_rgb(0_0_0/0.7)]">
          {WORDS.map((w, i) => (
            <motion.span
              key={w}
              initial={reduce ? false : { opacity: 0, y: "0.35em", filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: ARRIVE }}
              className="inline-block"
            >
              {w}&nbsp;
            </motion.span>
          ))}
          <motion.span
            initial={reduce ? false : { opacity: 0, y: "0.35em", filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.45, ease: ARRIVE }}
            className="serif-highlight inline-block text-[1.06em] text-white/95 drop-shadow-[0_0_25px_rgb(255_255_255/0.25)]"
          >
            meaning.
          </motion.span>
        </h1>
      </motion.div>

      {/* Navigation bar docked at bottom of hero */}
      <div className="relative mt-auto">
        <HeroNav />
      </div>
    </header>
  );
}
