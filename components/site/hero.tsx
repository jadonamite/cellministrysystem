"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import crowd from "@/public/images/zoneg/live/thanksgiving-crowd.jpg";
import { HeroNav } from "./section-nav";

const ARRIVE = [0.22, 1, 0.36, 1] as const;

/**
 * One full-width photograph from FYB Thanksgiving Sunday. The statement sits
 * on a soft shade across the top, where the wall is plain. Scrolling lets the
 * photo lag behind the page and the statement lift away.
 */
export function Hero() {
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);
  const wordsY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const wordsFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <header ref={ref} className="relative isolate flex min-h-svh flex-col overflow-hidden bg-midnight text-white">
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: photoY, scale: photoScale }}
        className="absolute inset-0 -z-20"
      >
        <Image
          src={crowd}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-[50%_60%]"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(7_11_36/0.88)_0%,rgb(7_11_36/0.62)_24%,rgb(7_11_36/0)_46%,rgb(7_11_36/0)_70%,rgb(7_11_36/0.72)_100%)]"
      />

      <motion.div
        style={reduce ? undefined : { y: wordsY, opacity: wordsFade }}
        className="px-4 pt-[max(10svh,calc(env(safe-area-inset-top)+48px))] text-center sm:px-10 sm:pt-[7svh]"
      >
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: ARRIVE }}
          className="display mx-auto max-w-[16ch] text-[clamp(2.875rem,6.5vw,5.75rem)] leading-[0.95] [text-shadow:0_2px_24px_rgb(7_11_36/0.35)]"
        >
          Giving your life a <span className="serif-highlight text-[1.06em] text-highlight">meaning.</span>
        </motion.h1>
      </motion.div>

      <div className="relative mt-auto">
        <HeroNav />
      </div>
    </header>
  );
}
