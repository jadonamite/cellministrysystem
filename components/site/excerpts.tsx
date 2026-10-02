"use client";

import { useRef } from "react";
import Image from "next/image";
import { EXCERPTS, INSTAGRAM_URL, type ExcerptSet } from "@/lib/site-content";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { FlyerButton } from "./flyer-button";

// every slide in the media team's carousels is about 1480 x 1600
const SLIDE = { width: 1480, height: 1600 };

/**
 * The media team's designed slides from each service: recaps and excerpts,
 * one swipeable row per set, in the order they were posted.
 */
export function Excerpts() {
  return (
    <section id="excerpts" className="scroll-mt-4 bg-white py-24 text-ink sm:py-32">
      <div className="px-4 sm:px-10">
        <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-ink/70 uppercase">From the service</p>
        <h2 className="display mt-4 max-w-[16ch] text-[clamp(2.75rem,6.5vw,5.25rem)]">
          Recaps and <span className="serif-highlight text-stage">excerpts</span>
        </h2>
      </div>
      <div className="mt-14 space-y-16 sm:mt-20 sm:space-y-20">
        {EXCERPTS.map((set) => (
          <Row key={set.title} set={set} />
        ))}
      </div>
      <p className="mt-14 px-4 text-[1rem] text-ink/75 sm:px-10">
        New sets go up after each service on{" "}
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="font-semibold text-stage underline underline-offset-4">
          @globalzoneg
        </a>
        .
      </p>
    </section>
  );
}

function Row({ set }: { set: ExcerptSet }) {
  const reduce = useReducedMotionSafe();
  const list = useRef<HTMLUListElement>(null);

  function page(dir: 1 | -1) {
    const el = list.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4 px-4 sm:px-10">
        <div>
          <h3 className="text-[1.375rem] leading-tight font-semibold">{set.title}</h3>
          <p className="mt-1 text-[0.9375rem] text-ink/70">
            {set.note} · {set.slides.length} slides
          </p>
        </div>
        <div className="flex gap-2">
          <PageButton label={`Previous ${set.title} slides`} onClick={() => page(-1)} flip />
          <PageButton label={`Next ${set.title} slides`} onClick={() => page(1)} />
        </div>
      </div>
      <ul
        ref={list}
        aria-label={`${set.title} slides`}
        className="mt-6 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:scroll-px-10 sm:gap-5 sm:px-10"
      >
        {set.slides.map((src, i) => (
          <li key={src} className="w-[min(72vw,20rem)] shrink-0 snap-start">
            <FlyerButton
              photo={{ src, ...SLIDE }}
              alt={`${set.title}, slide ${i + 1} of ${set.slides.length}`}
              title={`${set.title} slide ${i + 1}`}
              kind="photo"
              className="block w-full rounded-[18px] hover:scale-100 active:scale-[0.99]"
            >
              <Image
                src={src}
                alt={`${set.title}, slide ${i + 1} of ${set.slides.length}`}
                {...SLIDE}
                sizes="(min-width: 640px) 20rem, 72vw"
                className="h-auto w-full rounded-[18px] bg-ink/5"
              />
            </FlyerButton>
          </li>
        ))}
      </ul>
    </div>
  );
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
