"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { GALLERY, INSTAGRAM_URL } from "@/lib/site-content";
import { FlyerButton } from "./flyer-button";

/**
 * Follows design/references/gallery.jpeg: a strip of photos bent around a
 * cylinder, nearest at the centre, turning away towards the edges. The strip
 * is a real horizontal scroller (swipe, trackpad, arrow keys); page scroll
 * adds a slow sideways drift on top.
 */
export function Gallery() {
  const reduce = useReducedMotionSafe();
  const section = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["9vw", "-9vw"]);

  // bend each card by its distance from the centre of the screen
  useEffect(() => {
    const list = scroller.current;
    if (!list) return;
    const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-bend]"));
    if (reduce) {
      for (const card of cards) card.style.transform = "";
      return;
    }
    let frame = 0;
    const bend = () => {
      frame = 0;
      const half = window.innerWidth / 2;
      for (const card of cards) {
        const r = card.parentElement!.getBoundingClientRect();
        // on narrow screens the curve is measured in cards, so neighbours stay in view
        const span = Math.max(half, r.width * 1.8);
        const d = Math.max(-1.6, Math.min(1.6, (r.left + r.width / 2 - half) / span));
        card.style.transform = `translateZ(${(-d * d * 150).toFixed(1)}px) rotateY(${(d * 32).toFixed(2)}deg)`;
      }
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(bend);
    };
    bend();
    list.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    const unsub = drift.on("change", queue);
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener("scroll", queue);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      unsub();
    };
  }, [reduce, drift]);

  // start with the strip centred on its middle photo
  useEffect(() => {
    const list = scroller.current;
    if (list) list.scrollLeft = (list.scrollWidth - list.clientWidth) / 2;
  }, []);

  function page(dir: 1 | -1) {
    const list = scroller.current;
    const card = list?.querySelector("li");
    if (!list || !card) return;
    list.scrollBy({ left: dir * (card.getBoundingClientRect().width + 20) * 2, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section id="gallery" ref={section} className="scroll-mt-4 overflow-hidden bg-cream pt-28 pb-24 text-ink sm:pt-36 sm:pb-32">
      <div className="px-4 text-center sm:px-10">
        <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-ink/70 uppercase">Gallery</p>
        <h2 className="display mt-4 text-[clamp(2.75rem,7vw,5.75rem)]">
          Moments from <span className="serif-highlight text-stage">Zone G.</span>
        </h2>
      </div>

      <motion.div style={reduce ? undefined : { x: drift }} className="mt-14 sm:mt-20">
        <ul
          ref={scroller}
          aria-label="Photos from Zone G services and events"
          className="flex snap-x snap-proximity gap-5 overflow-x-auto px-[max(1rem,calc(50vw-9rem))] py-10 [scrollbar-width:none] sm:gap-6"
        >
          {GALLERY.map((g) => (
            <li key={g.src.src} className="w-[min(64vw,18rem)] shrink-0 snap-center [perspective:900px]">
              <div data-bend className="will-change-transform">
                <FlyerButton photo={g.src} alt={g.alt} title={g.event} kind="photo" className="group block w-full rounded-[22px] hover:scale-100 active:scale-[0.98]">
                  <span className="relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-ink/10 shadow-[0_30px_50px_-24px_rgb(11_16_48/0.55)]">
                    <Image
                      src={g.src}
                      alt={g.alt}
                      fill
                      sizes="(min-width: 640px) 18rem, 64vw"
                      className="object-cover transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  </span>
                </FlyerButton>
                <p className="mt-3 px-1 text-[0.875rem] leading-snug text-ink/70">{g.event}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 px-4">
        <button type="button" onClick={() => page(-1)} aria-label="Previous photos" className="key w-11 justify-center !px-0">
          <Arrow className="rotate-180" />
        </button>
        <button type="button" onClick={() => page(1)} aria-label="Next photos" className="key w-11 justify-center !px-0">
          <Arrow />
        </button>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="key key-gold px-5 text-[0.9375rem] font-semibold">
          More on @globalzoneg
        </a>
      </div>
    </section>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`size-5 ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
