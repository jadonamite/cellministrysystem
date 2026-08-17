"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DailyPoint } from "@/lib/data";

interface Props {
  daily: DailyPoint[];
  /** the team's css color (var(--team-N)) */
  color: string;
}

export function TeamActivityChart({ daily, color }: Props) {
  const config = {
    called: { label: "Called", color },
    messaged: {
      label: "Messaged",
      color: `color-mix(in srgb, ${color} 45%, transparent)`,
    },
  } satisfies ChartConfig;

  return (
    <div className="card-soft bg-card rounded-3xl p-5 sm:p-6">
      <h2 className="text-base font-bold">Daily activity</h2>
      <p className="text-muted-foreground mt-0.5 text-xs">
        This team&apos;s contacts reached per day, by channel
      </p>
      <div className="scroll-x mt-4">
        <div className="min-w-[520px]">
          <ChartContainer config={config} className="h-[240px] w-full">
            <BarChart data={daily} margin={{ left: 4, right: 12, top: 12 }} barSize={18}>
              <CartesianGrid vertical={false} strokeOpacity={0.3} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={30} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="called"
                stackId="a"
                fill="var(--color-called)"
                radius={[0, 0, 6, 6]}
                isAnimationActive={false}
              />
              <Bar
                dataKey="messaged"
                stackId="a"
                fill="var(--color-messaged)"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
