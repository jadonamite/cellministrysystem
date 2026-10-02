"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { INSTAGRAM_URL, LISTEN } from "@/lib/site-content";
import { cn } from "@/lib/utils";

// fixed bar heights so the waveform is identical on server and client
const BARS = Array.from({ length: 56 }, (_, i) =>
  Math.round((0.28 + 0.72 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43))) * 1000) / 1000,
);

function fmt(s: number) {
  if (!Number.isFinite(s)) return "--:--";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function ListenIn() {
  const audio = useRef<HTMLAudioElement>(null);
  const section = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const backdropY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const backdropScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.25, 1.12, 1.25]);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const ready = !!LISTEN.src;
  const progress = Number.isFinite(duration) && duration > 0 ? time / duration : 0;

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDuration(a.duration);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  function toggle() {
    const a = audio.current;
    if (!a || !ready) return;
    if (a.paused) {
      void a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function skip(by: number) {
    const a = audio.current;
    if (a && ready) a.currentTime = Math.max(0, Math.min(a.currentTime + by, a.duration || 0));
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audio.current;
    if (a && ready && Number.isFinite(a.duration)) a.currentTime = (Number(e.target.value) / 1000) * a.duration;
  }

  return (
    <section
      id="listen-in"
      ref={section}
      className="relative isolate scroll-mt-4 overflow-hidden bg-midnight px-4 py-28 text-cream sm:px-10 sm:py-40"
    >
      {/* the worship photo, out of focus, drifting slower than the page */}
      <motion.div
        aria-hidden
        style={reduce ? undefined : { y: backdropY, scale: backdropScale }}
        className="absolute inset-0 -z-20"
      >
        <Image src={LISTEN.backdrop} alt="" fill sizes="100vw" className="object-cover object-[50%_30%] blur-[2px] saturate-[1.15]" />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#070B24_0%,rgb(7_11_36/0.72)_22%,rgb(7_11_36/0.72)_78%,#070B24_100%)]"
      />
      <div className="mx-auto max-w-5xl">
        <h2 className="display text-[clamp(2.5rem,7vw,5.5rem)]">
          Listen <span className="serif-highlight text-highlight">in</span>
        </h2>
        <p className="mt-4 max-w-lg text-[1.0625rem] leading-[1.55] text-cream/80">
          Messages from our services, for the commute, the kitchen or the walk to lectures.
        </p>

        <div className="mt-12 flex flex-col gap-6 rounded-[36px] bg-midnight/55 p-4 ring-1 ring-cream/12 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-8 sm:p-5">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-[24px] sm:w-56">
            <Image src={LISTEN.artwork} alt={LISTEN.artworkAlt} fill sizes="(min-width: 640px) 224px, 100vw" className="object-cover" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-5 sm:pr-4">
            <div>
              <p className="text-[1.5rem] leading-tight font-bold">{LISTEN.title}</p>
              <p className="mt-1 text-[1rem] text-cream/75">{LISTEN.speaker}</p>
            </div>

            <div className="relative h-14">
              <div aria-hidden className="absolute inset-0 flex items-center gap-[3px]">
                {BARS.map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${(h * 100).toFixed(1)}%` }}
                    className={cn(
                      "flex-1 rounded-full transition-colors duration-150",
                      i / BARS.length < progress ? "bg-highlight" : "bg-cream/25",
                    )}
                  />
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                value={Math.round(progress * 1000)}
                onChange={seek}
                disabled={!ready}
                aria-label="Seek"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => skip(-15)}
                disabled={!ready}
                aria-label="Back 15 seconds"
                className="inline-grid size-11 place-items-center rounded-full text-[0.8125rem] font-semibold text-cream/80 hover:bg-cream/10 disabled:opacity-40"
              >
                -15
              </button>
              <button
                type="button"
                onClick={toggle}
                disabled={!ready}
                aria-label={playing ? "Pause" : "Play"}
                className="inline-grid size-14 place-items-center rounded-full bg-highlight text-highlight-foreground transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {playing ? (
                  <svg viewBox="0 0 24 24" aria-hidden className="size-6" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden className="ml-0.5 size-6" fill="currentColor">
                    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => skip(15)}
                disabled={!ready}
                aria-label="Forward 15 seconds"
                className="inline-grid size-11 place-items-center rounded-full text-[0.8125rem] font-semibold text-cream/80 hover:bg-cream/10 disabled:opacity-40"
              >
                +15
              </button>
              <p className="ml-auto text-[0.875rem] tabular-nums text-cream/75">
                {fmt(time)} / {fmt(duration)}
              </p>
            </div>

            {!ready && (
              <p className="text-[0.9375rem] text-cream/75">
                The first message is on its way.{" "}
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="font-semibold text-cream underline underline-offset-4">
                  Follow @globalzoneg
                </a>{" "}
                to hear when it lands.
              </p>
            )}
          </div>
        </div>
        {ready && <audio ref={audio} src={LISTEN.src ?? undefined} preload="metadata" />}
      </div>
    </section>
  );
}
