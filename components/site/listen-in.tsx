"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  ShuffleIcon,
  SkipBackIcon,
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
  RepeatIcon,
  AirplayIcon,
  ShareNetworkIcon,
  PlaylistIcon,
  CheckIcon,
  CaretLeftIcon,
  CaretRightIcon,
  SpeakerSimpleXIcon,
} from "@phosphor-icons/react";
import { INSTAGRAM_URL, LISTEN } from "@/lib/site-content";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  title: string;
  speaker: string;
  duration: number; // in seconds
  series: string;
}

const PLAYLIST: Track[] = [
  {
    id: "1",
    title: "The Law of the Spirit of Life",
    speaker: "Pastor John Ajimuda",
    duration: 202, // 3:22
    series: "Sunday Nuggets · Vol. 1",
  },
  {
    id: "2",
    title: "Living from the Inside Out",
    speaker: "Pastor John Ajimuda",
    duration: 254, // 4:14
    series: "Sunday Nuggets · Vol. 2",
  },
  {
    id: "3",
    title: "The Pattern of Luxuriant Growth",
    speaker: "Pastor John Ajimuda",
    duration: 218, // 3:38
    series: "Sunday Nuggets · Vol. 3",
  },
  {
    id: "4",
    title: "The Finished Works of Christ",
    speaker: "Pastor John Ajimuda",
    duration: 185, // 3:05
    series: "Sunday Nuggets · Vol. 4",
  },
];

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ListenIn() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(180); // Default to 3:00 to match reference preview aesthetic
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentTrack = PLAYLIST[trackIndex];
  const hasAudioSource = Boolean(LISTEN.src);
  const totalDuration = currentTrack.duration;
  const progress = totalDuration > 0 ? Math.min(1, currentTime / totalDuration) : 0;

  // Real audio playback integration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudioSource) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        void audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [hasAudioSource, repeat]);

  // Simulated audio playback ticker when no live audio source is wired yet
  useEffect(() => {
    if (hasAudioSource || !playing) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) {
          if (repeat) {
            return 0;
          }
          setPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasAudioSource, playing, totalDuration, repeat]);

  const togglePlay = () => {
    if (hasAudioSource && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        void audioRef.current.play();
        setPlaying(true);
      }
    } else {
      setPlaying((prev) => !prev);
    }
  };

  const handleNext = useCallback(() => {
    setCurrentTime(0);
    if (shuffle) {
      const nextIdx = Math.floor(Math.random() * PLAYLIST.length);
      setTrackIndex(nextIdx);
    } else {
      setTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    }
    if (hasAudioSource && audioRef.current) {
      audioRef.current.currentTime = 0;
      if (playing) void audioRef.current.play();
    }
  }, [shuffle, hasAudioSource, playing]);

  const handlePrev = useCallback(() => {
    if (currentTime > 5) {
      setCurrentTime(0);
      if (hasAudioSource && audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }
    setCurrentTime(0);
    setTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    if (hasAudioSource && audioRef.current) {
      audioRef.current.currentTime = 0;
      if (playing) void audioRef.current.play();
    }
  }, [currentTime, hasAudioSource, playing]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fraction = Number(e.target.value) / 1000;
    const newTime = fraction * totalDuration;
    setCurrentTime(newTime);
    if (hasAudioSource && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = typeof window !== "undefined" ? window.location.href : INSTAGRAM_URL;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareUrl}#listen-in`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // clipboard access error handled gracefully
    }
  };

  return (
    <section id="listen-in" className="scroll-mt-4 bg-cream px-4 py-20 text-ink sm:px-10 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="mb-10 sm:mb-14">
          <h2 className="display text-[clamp(2.5rem,7vw,5.5rem)]">
            Listen <span className="serif-highlight text-ink">in</span>
          </h2>
          <p className="mt-3 max-w-lg text-[1rem] sm:text-[1.0625rem] leading-[1.55] text-ink/75">
            Messages from our services, for the commute, the kitchen or the walk to lectures.
          </p>
        </div>

        {/* Center Stage UI Composition */}
        <div className="relative mx-auto w-full max-w-[540px] pt-12 sm:pt-16 pb-6">
          {/* Big background typographic watermark (mimicking the top bold lettering in reference) */}
          <div className="pointer-events-none absolute -top-4 sm:-top-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-center z-0">
            <span className="font-extrabold uppercase tracking-tight text-ink/[0.06] text-[clamp(4.5rem,14vw,8.5rem)] leading-none select-none block">
              ZONE G
            </span>
          </div>

          {/* Carousel Next side button (matches reference image's circular right arrow) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next message"
            className="absolute -right-3 sm:-right-6 top-[38%] -translate-y-1/2 z-40 size-9 sm:size-10 rounded-full bg-white shadow-[0_8px_20px_-4px_rgba(11,14,23,0.2)] border border-black/5 text-ink/75 flex items-center justify-center hover:scale-105 hover:text-ink active:scale-95 transition-all"
          >
            <CaretRightIcon weight="bold" className="size-5" />
          </button>

          {/* Carousel Prev side button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous message"
            className="absolute -left-3 sm:-left-6 top-[38%] -translate-y-1/2 z-40 size-9 sm:size-10 rounded-full bg-white shadow-[0_8px_20px_-4px_rgba(11,14,23,0.2)] border border-black/5 text-ink/75 flex items-center justify-center hover:scale-105 hover:text-ink active:scale-95 transition-all"
          >
            <CaretLeftIcon weight="bold" className="size-5" />
          </button>

          {/* Visual Collage Stack */}
          <div className="relative z-10">
            {/* 1. TOP CARD (Preacher with 3D Pop-out Head) */}
            <div className="relative w-full h-[320px] sm:h-[370px]">
              {/* Rounded Base Card (starts at top-8 so preacher's head pops out above) */}
              <div className="absolute inset-x-0 bottom-0 top-8 sm:top-10 rounded-[28px] sm:rounded-[36px] overflow-hidden bg-gradient-to-b from-[#182855] via-[#0d152c] to-[#070b16] border border-white/10 shadow-[0_24px_50px_-12px_rgba(11,14,23,0.35)]">
                {/* Stage Lighting Radial Glows */}
                <div className="absolute -top-16 left-1/3 size-72 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 -right-16 size-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

                {/* Background Watermark Monogram */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <span className="text-[5.5rem] sm:text-[7rem] font-black uppercase tracking-widest text-white/[0.035] -rotate-6">
                    BLW
                  </span>
                </div>

                {/* Vertical Brand Typography along Right Edge */}
                <div className="absolute right-4 sm:right-6 top-6 sm:top-8 z-10 flex flex-col items-center gap-2 select-none [writing-mode:vertical-rl] text-[9px] sm:text-[10px] tracking-[0.22em] font-mono uppercase text-white/60">
                  <span className="inline-block rotate-90 text-[7px] text-white/40">▶</span>
                  <span>BLW ZONE G</span>
                  <span className="text-white/30">·</span>
                  <span>SUNDAY NUGGETS</span>
                </div>
              </div>

              {/* Pop-Out Minister Cutout (Head breaks 32px-40px above the card border) */}
              <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-center pointer-events-none z-10">
                <div className="relative h-full w-auto aspect-[1600/1672]">
                  <Image
                    src="/images/zoneg/live/sunday-preacher.png"
                    alt="Pastor John Ajimuda preaching"
                    fill
                    sizes="(min-width: 640px) 420px, 340px"
                    priority
                    className="object-contain object-bottom drop-shadow-[0_18px_35px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            </div>

            {/* 2. BOTTOM HORIZONTAL CONGREGATION STRIPS */}
            <div className="mt-3 sm:mt-3.5 flex flex-col gap-2.5 sm:gap-3 relative z-10">
              {/* Strip 1: Congregation in worship */}
              <div className="relative h-16 sm:h-20 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-black/5 shadow-md">
                <Image
                  src="/images/zoneg/live/worship-eyes-closed.jpg"
                  alt="Congregation worshipping"
                  fill
                  sizes="(min-width: 640px) 540px, 100vw"
                  className="object-cover object-[center_35%]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/35 pointer-events-none" />
              </div>

              {/* Strip 2: Hands raised in prayer */}
              <div className="relative h-16 sm:h-20 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-black/5 shadow-md">
                <Image
                  src="/images/zoneg/live/raised-hands.jpg"
                  alt="Congregation in prayer with raised hands"
                  fill
                  sizes="(min-width: 640px) 540px, 100vw"
                  className="object-cover object-[center_30%]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/35 pointer-events-none" />
              </div>
            </div>

            {/* 3. FOREGROUND MONOCHROME WORSHIPPER / SINGER CUTOUT */}
            {/* Rises from the bottom strips and reaches up over the strips into the frosted player */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex items-end justify-center">
              <div className="relative h-[290px] sm:h-[350px] w-auto aspect-[1257/1598] filter grayscale contrast-125 brightness-95 drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]">
                <Image
                  src="/images/zoneg/live/singer-pink.png"
                  alt="Worship leader leading praise"
                  fill
                  sizes="(min-width: 640px) 350px, 290px"
                  className="object-contain object-bottom"
                />
              </div>
            </div>

            {/* 4. FLOATING FROSTED GLASS AUDIO PLAYER CARD */}
            {/* Sits right over the junction of top card & congregation strips */}
            <div className="absolute top-[205px] sm:top-[245px] left-1/2 -translate-x-1/2 w-[92%] sm:w-[410px] z-30">
              <div className="relative rounded-[26px] sm:rounded-[30px] p-5 sm:p-6 backdrop-blur-2xl bg-white/[0.22] dark:bg-black/35 border border-white/50 shadow-[0_24px_55px_-12px_rgba(0,0,0,0.45),inset_0_1px_1px_0_rgba(255,255,255,0.6)] text-white">
                {/* Track Title & Speaker */}
                <div className="text-center select-none">
                  <p className="text-[15px] sm:text-[16px] font-semibold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    {currentTrack.title}
                  </p>
                  <p className="mt-0.5 text-[12px] sm:text-[13px] font-medium text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    {currentTrack.speaker}
                  </p>
                </div>

                {/* Progress Scrubber Line */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="w-8 text-right font-mono text-[11px] sm:text-[12px] text-white/90 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] select-none">
                    {fmt(currentTime)}
                  </span>
                  <div className="relative flex-1 py-2">
                    {/* Background line track */}
                    <div className="h-[3px] w-full rounded-full bg-white/35 overflow-hidden">
                      {/* Filled progress bar */}
                      <div
                        className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-75"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                    {/* Scrubber thumb handle */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-2.5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.6)] pointer-events-none transition-all duration-75"
                      style={{ left: `${progress * 100}%` }}
                    />
                    {/* Range scrubber input */}
                    <input
                      type="range"
                      min={0}
                      max={1000}
                      value={Math.round(progress * 1000)}
                      onChange={handleSeek}
                      aria-label="Seek track position"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </div>
                  <span className="w-8 text-left font-mono text-[11px] sm:text-[12px] text-white/90 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] select-none">
                    {fmt(totalDuration)}
                  </span>
                </div>

                {/* Main Playback Controls */}
                <div className="mt-4 flex items-center justify-between px-2 sm:px-3">
                  {/* Shuffle */}
                  <button
                    type="button"
                    onClick={() => setShuffle((s) => !s)}
                    aria-label={shuffle ? "Disable shuffle" : "Enable shuffle"}
                    className={cn(
                      "rounded-full p-2 transition-all hover:scale-105 active:scale-95",
                      shuffle ? "text-white" : "text-white/60 hover:text-white"
                    )}
                  >
                    <ShuffleIcon weight="bold" className="size-4 sm:size-[18px]" />
                  </button>

                  {/* Previous */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous track"
                    className="rounded-full p-2 text-white hover:opacity-80 active:scale-95 transition-all"
                  >
                    <SkipBackIcon weight="fill" className="size-5 sm:size-6" />
                  </button>

                  {/* Central Play / Pause Button */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? "Pause" : "Play"}
                    className="size-12 sm:size-13 rounded-full bg-white text-ink flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all"
                  >
                    {playing ? (
                      <PauseIcon weight="fill" className="size-5 sm:size-6 text-ink" />
                    ) : (
                      <PlayIcon weight="fill" className="size-5 sm:size-6 text-ink ml-0.5" />
                    )}
                  </button>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next track"
                    className="rounded-full p-2 text-white hover:opacity-80 active:scale-95 transition-all"
                  >
                    <SkipForwardIcon weight="fill" className="size-5 sm:size-6" />
                  </button>

                  {/* Repeat */}
                  <button
                    type="button"
                    onClick={() => setRepeat((r) => !r)}
                    aria-label={repeat ? "Disable repeat" : "Enable repeat"}
                    className={cn(
                      "rounded-full p-2 transition-all hover:scale-105 active:scale-95",
                      repeat ? "text-white" : "text-white/60 hover:text-white"
                    )}
                  >
                    <RepeatIcon weight="bold" className="size-4 sm:size-[18px]" />
                  </button>
                </div>

                {/* Bottom Utility Bar */}
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between px-3 text-white/75">
                  {/* Airplay / Device */}
                  <button
                    type="button"
                    onClick={() => setIsMuted((m) => !m)}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    className="p-1.5 hover:text-white transition-colors"
                    title={isMuted ? "Unmute" : "Audio Device"}
                  >
                    {isMuted ? <SpeakerSimpleXIcon weight="fill" className="size-4 sm:size-[18px]" /> : <AirplayIcon weight="fill" className="size-4 sm:size-[18px]" />}
                  </button>

                  {/* Share */}
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share message link"
                    className="p-1.5 hover:text-white transition-colors relative"
                    title="Share"
                  >
                    {copied ? <CheckIcon weight="bold" className="size-4 sm:size-[18px] text-white" /> : <ShareNetworkIcon weight="fill" className="size-4 sm:size-[18px]" />}
                    {copied && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-medium bg-black/85 text-white px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                        Copied
                      </span>
                    )}
                  </button>

                  {/* Queue / Playlist */}
                  <button
                    type="button"
                    onClick={() => setShowQueue((q) => !q)}
                    aria-label="Toggle playlist queue"
                    className={cn(
                      "p-1.5 transition-colors hover:text-white",
                      showQueue ? "text-white" : "text-white/75"
                    )}
                    title="Playlist queue"
                  >
                    <PlaylistIcon weight="fill" className="size-4 sm:size-[18px]" />
                  </button>
                </div>

                {/* Playlist Queue Expandable Overlay */}
                {showQueue && (
                  <div className="mt-4 pt-3 border-t border-white/20 flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-white/60 px-1 mb-1">
                      Upcoming Messages
                    </p>
                    {PLAYLIST.map((t, idx) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTrackIndex(idx);
                          setCurrentTime(0);
                          setPlaying(true);
                          setShowQueue(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors",
                          idx === trackIndex
                            ? "bg-white/20 text-white font-semibold"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span className="truncate pr-2">{t.title}</span>
                        <span className="font-mono text-[10px] opacity-70 shrink-0">{fmt(t.duration)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Note / Follow link */}
        <p className="mt-14 text-center text-[0.9375rem] text-ink/65">
          New messages drop weekly.{" "}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ink underline underline-offset-4 hover:opacity-80"
          >
            Follow @globalzoneg
          </a>{" "}
          for service releases and podcast updates.
        </p>

        {/* Native audio tag when source is available */}
        {hasAudioSource && (
          <audio
            ref={audioRef}
            src={LISTEN.src ?? undefined}
            preload="metadata"
            muted={isMuted}
          />
        )}
      </div>
    </section>
  );
}
