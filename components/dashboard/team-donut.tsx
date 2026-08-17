"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { OutcomeSlice } from "@/lib/data";
import { cn } from "@/lib/utils";

export interface TeamSlice {
  id: string;
  name: string;
  total: number;
  color: string; // css var
}

interface Props {
  teams: TeamSlice[];
  outcomes: OutcomeSlice[];
  /** bigger, bolder rendering — used for the standalone downloadable report */
  large?: boolean;
}

const OUTCOME_COLORS: Record<string, string> = {
  answered: "var(--primary)",
  no_answer: "var(--team-3)",
  messaged_only: "var(--team-2)",
  not_contacted: "var(--chart-5)",
};

export function TeamDonut({ teams, outcomes, large = false }: Props) {
  const total = teams.reduce((n, t) => n + t.total, 0);
  const config = Object.fromEntries(
    teams.map((t) => [t.id, { label: t.name, color: t.color }])
  ) satisfies ChartConfig;
  const data = teams.map((t) => ({ ...t, fill: t.color }));
  const reachedTotal = outcomes.reduce((n, o) => n + o.count, 0);

  return (
    <div className="card-soft bg-card flex h-full min-w-0 flex-col rounded-3xl p-5 sm:p-6">
      <h2 className={cn("font-bold", large ? "text-xl" : "text-base")}>Collation by team</h2>
      <p className={cn("text-muted-foreground mt-0.5", large ? "text-sm" : "text-xs")}>
        Every contact credited to the team that brought it
      </p>

      <div className="mt-2 flex min-w-0 flex-wrap items-center justify-center gap-4 sm:gap-5">
        <div className="relative shrink-0">
          <ChartContainer config={config} className={cn("aspect-square", large ? "h-[252px]" : "h-[172px]")}>
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="id" hideLabel />} />
              <Pie
                data={data}
                dataKey="total"
                nameKey="id"
                innerRadius={large ? 84 : 56}
                outerRadius={large ? 122 : 82}
                paddingAngle={3}
                cornerRadius={6}
                strokeWidth={0}
                isAnimationActive={false}
              />
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("leading-none font-bold tabular-nums", large ? "text-4xl" : "text-xl")}>
              {total.toLocaleString()}
            </span>
            <span className={cn("text-muted-foreground mt-0.5 font-bold tracking-widest uppercase", large ? "text-[11px]" : "text-[9px]")}>
              people
            </span>
          </div>
        </div>
        <ul className={cn("min-w-[200px] flex-1", large ? "space-y-3.5" : "space-y-2.5")}>
          {data.map((t) => (
            <li key={t.id} className={cn("flex min-w-0 items-center gap-2", large ? "text-base" : "text-sm")}>
              <span
                className={cn("shrink-0 rounded-full", large ? "size-3" : "size-2.5")}
                style={{ background: t.color }}
              />
              <span className="text-muted-foreground truncate font-medium">
                {t.name}
              </span>
              <span className="ml-auto shrink-0 font-bold tabular-nums">
                {t.total.toLocaleString()}
              </span>
              <span className={cn("text-muted-foreground shrink-0 text-right tabular-nums", large ? "w-11 text-sm" : "w-9 text-xs")}>
                {total ? Math.round((t.total / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-4">
        <p className={cn("text-muted-foreground mb-2 font-bold tracking-widest uppercase", large ? "text-xs" : "text-[10px]")}>
          Contact outcomes
        </p>
        <div className={cn("flex w-full gap-0.5 overflow-hidden rounded-full", large ? "h-4" : "h-3")}>
          {outcomes.map((o) => (
            <div
              key={o.outcome}
              style={{
                width: `${(o.count / reachedTotal) * 100}%`,
                background: OUTCOME_COLORS[o.outcome],
              }}
            />
          ))}
        </div>
        <div className={cn("mt-2.5 grid grid-cols-2 gap-x-3", large ? "gap-y-2" : "gap-y-1.5")}>
          {outcomes.map((o) => (
            <span key={o.outcome} className={cn("flex items-center gap-1.5", large ? "text-sm" : "text-xs")}>
              <span
                className={cn("rounded-full", large ? "size-2.5" : "size-2")}
                style={{ background: OUTCOME_COLORS[o.outcome] }}
              />
              <span className="text-muted-foreground">{o.label}</span>
              <span className="ml-auto font-semibold tabular-nums">{o.count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
