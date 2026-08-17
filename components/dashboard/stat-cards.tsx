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
  /** hero card — solid royal blue */
  hero?: boolean;
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
      className="grid grid-cols-2 gap-4 lg:grid-cols-5"
    >
      {stats.map((s) => {
        return (
          <motion.div
            key={s.label}
            variants={fadeInUp}
            className={cn(
              "card-soft rounded-3xl p-5",
              s.hero
                ? "bg-primary text-primary-foreground col-span-2 lg:col-span-1"
                : "bg-card"
            )}
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl",
                  s.hero ? "bg-white/20" : "bg-accent text-accent-foreground"
                )}
              >
                <Icon name={ICONS[s.icon]} className="size-4" />
              </span>
              {s.spark && <Sparkline data={s.spark} hero={s.hero} />}
            </div>
            <div className="mt-4 text-[1.65rem] leading-none font-bold tabular-nums">
              {s.value}
            </div>
            <p
              className={cn(
                "mt-1.5 text-xs font-medium",
                s.hero ? "text-white/75" : "text-muted-foreground",
                !s.hero && s.trend === "down" && "text-destructive",
                !s.hero && s.trend === "up" && "text-[var(--team-2)]"
              )}
            >
              {s.hint}
            </p>
            <p
              className={cn(
                "mt-2 text-[10px] font-bold tracking-widest uppercase",
                s.hero ? "text-white/60" : "text-muted-foreground/70"
              )}
            >
              {s.label}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
