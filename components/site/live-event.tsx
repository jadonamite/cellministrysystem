"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { INSTAGRAM_URL, LIVE_EVENT } from "@/lib/site-content";
import { FlyerButton } from "./flyer-button";

/**
 * The next event as a card that tilts upright as it scrolls into view, with
 * photos from the last LIFT drifting behind it at their own speeds. The page
 * turns from midnight to cream through this section.
 */
export function LiveEvent() {
  const e = LIVE_EVENT;
  const reduce = useReducedMotionSafe();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  const tilt = useTransform(scrollYProgress, [0.05, 0.4], [14, 0]);
  const rise = useTransform(scrollYProgress, [0.05, 0.4], [80, 0]);
  const backA = useTransform(scrollYProgress, [0, 1], [140, -160]);
  const backB = useTransform(scrollYProgress, [0, 1], [40, -320]);
  const [a, b] = e.photos;

  return (
    <section
      id="live-event"
      ref={ref}
      className="relative isolate scroll-mt-4 overflow-hidden bg-[linear-gradient(180deg,#070B24_0%,#070B24_30%,#3A3A58_62%,#F6EBDE_100%)] px-4 py-28 sm:px-10 sm:py-40"
    >
      {/* the last LIFT, behind the card */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: backA }}
        className="absolute top-[42%] -left-10 -z-10 hidden aspect-[3/4] w-[22vw] max-w-80 -rotate-6 overflow-hidden rounded-[28px] opacity-70 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] md:block"
      >
        <Image src={a.src} alt="" fill sizes="22vw" className="object-cover" />
      </motion.div>
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: backB }}
        className="absolute top-[30%] -right-8 -z-10 hidden aspect-[3/4] w-[20vw] max-w-72 rotate-[7deg] overflow-hidden rounded-[28px] opacity-70 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] md:block"
      >
        <Image src={b.src} alt="" fill sizes="20vw" className="object-cover" />
      </motion.div>

      <div className="mx-auto max-w-5xl [perspective:1400px]">
        <h2 className="display text-[clamp(2.5rem,7vw,5.5rem)] text-cream">
          Live <span className="serif-highlight text-highlight">event</span>
        </h2>

        <motion.div
          style={reduce ? undefined : { rotateX: tilt, y: rise }}
          className="mt-12 grid origin-bottom overflow-hidden rounded-[36px] bg-midnight-2 text-cream shadow-[0_50px_100px_-30px_rgb(0_0_0/0.75)] ring-1 ring-cream/10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
        >
          <FlyerButton photo={e.flyer} alt={e.flyerAlt} title={e.name} className="block w-full rounded-none hover:scale-100 active:scale-100">
            <span className="relative block aspect-[566/640] w-full md:h-full">
              <Image src={e.flyer} alt={e.flyerAlt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </span>
          </FlyerButton>

          <div className="flex flex-col justify-center gap-6 p-6 sm:p-10">
            <span className="inline-flex self-start rounded-full bg-highlight px-4 py-1.5 text-[0.875rem] font-semibold text-highlight-foreground">
              Coming up
            </span>
            <div>
              <p className="display text-[clamp(3.5rem,9vw,6.5rem)]">{e.name}</p>
              <p className="serif-highlight mt-2 text-[clamp(1.375rem,2.6vw,1.875rem)] text-cream/90">{e.expansion}</p>
            </div>
            <dl className="grid gap-4 text-[1rem]">
              <div>
                <dt className="text-[0.8125rem] font-semibold text-cream/65">Hosted by</dt>
                <dd className="mt-1">{e.host}</dd>
              </div>
              <div>
                <dt className="text-[0.8125rem] font-semibold text-cream/65">Ministering</dt>
                <dd className="mt-1">
                  {e.speaker}
                  <span className="ml-2 rounded-full bg-stage px-2.5 py-0.5 text-[0.8125rem] font-semibold text-white">
                    {e.speakerNote}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[0.8125rem] font-semibold text-cream/65">When</dt>
                <dd className="mt-1">{e.date}</dd>
              </div>
            </dl>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="key key-gold self-start px-5 text-[0.9375rem] font-semibold">
              Follow for updates
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
