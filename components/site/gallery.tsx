"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { INSTAGRAM_URL } from "@/lib/site-content";
import type { GalleryPhoto } from "@/lib/gallery-source";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { FlyerButton, type Picture } from "./flyer-button";

/**
 * Follows design/references/gallery.jpeg: large photos bent around a cylinder,
 * nearest at the centre, turning away towards the edges. The strip is a real
 * horizontal scroller; page scroll adds a slow sideways drift. The photos come
 * from lib/gallery-source.ts and change every few hours.
 */
export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const reduce = useReducedMotionSafe();
  const section = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["7vw", "-7vw"]);

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
        const span = Math.max(half, r.width * 1.6);
        const d = Math.max(-1.5, Math.min(1.5, (r.left + r.width / 2 - half) / span));
        card.style.transform = `translateZ(${(-d * d * 120).toFixed(1)}px) rotateY(${(d * 24).toFixed(2)}deg)`;
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

  // start centred on the middle photo
  useEffect(() => {
    const list = scroller.current;
    if (list) list.scrollLeft = (list.scrollWidth - list.clientWidth) / 2;
  }, []);

  function page(dir: 1 | -1) {
    const list = scroller.current;
    const card = list?.querySelector("li");
    if (!list || !card) return;
    list.scrollBy({ left: dir * (card.getBoundingClientRect().width + 24), behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section id="gallery" ref={section} className="scroll-mt-4 overflow-hidden bg-white pt-24 pb-24 text-ink sm:pt-32 sm:pb-32">
      <div className="px-4 text-center sm:px-10">
        <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-ink/70 uppercase">Gallery</p>
        <h2 className="display mt-4 text-[clamp(2.75rem,7vw,5.75rem)]">
          Moments from <span className="serif-highlight text-ink">Zone G.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[40ch] text-[1rem] leading-[1.5] text-ink/70">
          Straight from the photographers. The selection changes through the day.
        </p>
      </div>

      <motion.div style={reduce ? undefined : { x: drift }} className="mt-12 sm:mt-16">
        <ul
          ref={scroller}
          aria-label="Photos from Zone G services and events"
          className="flex snap-x snap-proximity gap-6 overflow-x-auto px-[max(1rem,calc(50vw-13rem))] py-10 [scrollbar-width:none]"
        >
          {photos.map((p) => (
            <li key={p.key} className="w-[min(80vw,26rem)] shrink-0 snap-center [perspective:1200px]">
              <div data-bend className="will-change-transform">
                <FlyerButton
                  photo={full(p)}
                  alt={p.alt}
                  title={p.event}
                  kind="photo"
                  className="group block w-full rounded-[24px] hover:scale-100 active:scale-[0.99]"
                >
                  <span className="relative block aspect-[4/5] overflow-hidden rounded-[26px] bg-ink/5 shadow-[0_8px_16px_-4px_rgb(11_14_23/0.12),0_24px_48px_-12px_rgb(11_14_23/0.25),0_40px_80px_-20px_rgb(11_14_23/0.35),inset_0_1px_0_0_rgb(255_255_255/0.4)] border border-black/[0.08] transition-transform duration-300 group-hover:scale-[1.02]">
                    <Photo photo={p} />
                  </span>
                </FlyerButton>
                <p className="mt-3 px-1 text-[0.9375rem] text-ink/70">{p.event}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 px-4">
        <PageButton label="Previous photo" onClick={() => page(-1)} flip />
        <PageButton label="Next photo" onClick={() => page(1)} />
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[0.9375rem] font-semibold text-white transition-opacity duration-150 hover:bg-black"
        >
          More on @globalzoneg
        </a>
      </div>
    </section>
  );
}

const CARD_SIZES = "(min-width: 640px) 26rem, 80vw";

function Photo({ photo: p }: { photo: GalleryPhoto }) {
  const cls = "object-cover transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]";
  if (p.image.kind === "local") {
    return <Image src={p.image.src} alt={p.alt} fill sizes={CARD_SIZES} className={cls} />;
  }
  const base = `/gallery-photo/${p.image.id}`;
  return (
    // already sized by /gallery-photo, so a plain img with a srcset is enough
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${base}/960`}
      srcSet={`${base}/480 480w, ${base}/960 960w, ${base}/1600 1600w`}
      sizes={CARD_SIZES}
      alt={p.alt}
      loading="lazy"
      decoding="async"
      className={`absolute inset-0 h-full w-full ${cls}`}
    />
  );
}

function full(p: GalleryPhoto): Picture {
  if (p.image.kind === "local") return p.image.src;
  const { id, width, height } = p.image;
  return { src: `/gallery-photo/${id}/1600`, width, height, unoptimized: true };
}

function PageButton({ label, onClick, flip }: { label: string; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-grid size-11 place-items-center rounded-full border border-ink/15 text-ink transition-colors duration-150 hover:bg-ink/[0.05]"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={`size-5 ${flip ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}
