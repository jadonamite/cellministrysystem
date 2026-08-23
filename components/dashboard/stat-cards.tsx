"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/icons";
import { fadeInUp, staggerContainer, spring } from "@/lib/motion";

export interface Stat {
  label: string;
  value: string;
  hint: string;
  icon: "reached" | "called" | "messaged" | "connect" | "followup";
  /** weekly series rendered as a mini bar sparkline */
  spark?: number[];
  /** hero card — solid lavender */
  hero?: boolean;
  /** the one figure on the screen that needs a human to act — gold, once */
  gold?: boolean;
  /** hint tone */
  trend?: "up" | "down";
}

const ICONS: Record<Stat["icon"], IconName> = {
  reached: "teams",
  called: "call",
  messaged: "message",
  connect: "phone-outgoing",
  followup: "followups",
};

function Sparkline({ data, hero }: { data: number[]; hero?: boolean }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-8 items-end gap-1" aria-hidden>
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max((v / max) * 100, 12)}%` }}
          transition={{ ...spring, delay: 0.15 + i * 0.03 }}
          className={cn(
            "w-1.5 rounded-full",
            hero ? "bg-white/45" : "bg-primary/25",
            i === data.length - 1 && (hero ? "bg-white" : "bg-primary")
          )}
        />
      ))}
    </div>
  );
}

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((s) => {
        return (
          <motion.div
            key={s.label}
            variants={fadeInUp}
            className={cn(
              "relative overflow-hidden rounded-3xl border p-6 backdrop-blur-2xl transition-all",
              s.gold
                ? "border-amber-500/40 bg-amber-500/5 dark:border-amber-500/30 dark:bg-amber-500/10"
                : "border-zinc-200/90 bg-white/85 dark:border-white/[0.08] dark:bg-zinc-900/60"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider",
                s.gold ? "text-amber-800 dark:text-amber-400" : "text-zinc-500 dark:text-zinc-400"
              )}>
                {s.label}
              </span>
              <span
                className={cn(
                  "p-2.5 rounded-2xl border flex items-center justify-center shrink-0",
                  s.gold
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    : s.hero
                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 border-zinc-200 dark:border-white/5"
                )}
              >
                <Icon name={ICONS[s.icon]} className="size-5" />
              </span>
            </div>
            
            <div className="space-y-1">
              <div
                className={cn(
                  "text-3xl font-extrabold tracking-tight tabular-nums",
                  s.gold ? "text-amber-800 dark:text-amber-300" : "text-zinc-950 dark:text-white"
                )}
              >
                {s.value}
              </div>
              <p
                className={cn(
                  "text-xs font-semibold flex items-center gap-1",
                  s.gold
                    ? "text-amber-800/80 dark:text-amber-400/90"
                    : s.trend === "up"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : s.trend === "down"
                        ? "text-red-500 dark:text-red-400"
                        : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {s.hint}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
