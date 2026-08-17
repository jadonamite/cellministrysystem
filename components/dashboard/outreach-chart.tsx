"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import type { DailyPoint, PacePoint } from "@/lib/data";

const activityConfig = {
  called: {
    label: "Called",
    theme: { light: "#2f5ce6", dark: "#4a74f0" },
  },
  messaged: {
    label: "Messaged",
    theme: { light: "#93aaf3", dark: "#8fa5f4" },
  },
} satisfies ChartConfig;

const paceConfig = {
  actual: {
    label: "Reached (actual)",
    theme: { light: "#2f5ce6", dark: "#4a74f0" },
  },
  target: {
    label: "Plan target",
    theme: { light: "#9a9aa4", dark: "#6e6e78" },
  },
} satisfies ChartConfig;

/** value pill above the biggest bar — the CRM-style callout */
function PeakLabel(props: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: number | string;
}) {
  const { x, y, width, value } = props;
  if (value === undefined || value === null || value === 0) return null;
  const cx = Number(x) + Number(width) / 2;
  const cy = Number(y) - 14;
  const text = Number(value).toLocaleString();
  const w = text.length * 7.5 + 18;
  return (
    <g>
      <rect
        x={cx - w / 2}
        y={cy - 11}
        width={w}
        height={22}
        rx={11}
        fill="var(--primary)"
      />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fill="var(--primary-foreground)"
        fontSize={11}
        fontWeight={700}
      >
        {text}
      </text>
    </g>
  );
}

interface Props {
  daily: DailyPoint[];
  pace: PacePoint[];
  planWeeks: number;
}

export function OutreachChart({ daily, pace, planWeeks }: Props) {
  const [view, setView] = useState("daily");

  const weekly = Array.from({ length: planWeeks }, (_, i) => ({
    label: `W${i + 1}`,
    called: daily.filter((d) => d.week === i + 1).reduce((n, d) => n + d.called, 0),
    messaged: daily.filter((d) => d.week === i + 1).reduce((n, d) => n + d.messaged, 0),
  })).filter((w, i) => i <= (daily.at(-1)?.week ?? 1) - 1);

  const source = view === "daily" ? daily : weekly;
  const totals = source.map((d) => d.called + d.messaged);
  const peakIndex = totals.indexOf(Math.max(...totals));
  // `peak` only exists on the tallest bar, so the callout can't drift
  const barData = source.map((d, i) => ({
    ...d,
    peak: i === peakIndex ? totals[i] : undefined,
  }));

  return (
    <div className="card-soft bg-card rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold">
            Outreach over the {planWeeks}-week plan
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {view === "pace"
              ? "Cumulative people reached vs. the plan target"
              : "People contacted, by channel"}
          </p>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsList className="rounded-full">
            <TabsTrigger className="rounded-full" value="daily">Daily</TabsTrigger>
            <TabsTrigger className="rounded-full" value="weekly">Weekly</TabsTrigger>
            <TabsTrigger className="rounded-full" value="pace">Plan pace</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="scroll-x mt-5">
        <div className="min-w-[560px]">
        {view === "pace" ? (
          <ChartContainer config={paceConfig} className="h-[290px] w-full">
            <LineChart data={pace} margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} strokeOpacity={0.3} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} interval={6} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="target"
                type="monotone"
                stroke="var(--color-target)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
              <Line
                dataKey="actual"
                type="monotone"
                stroke="var(--color-actual)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={activityConfig} className="h-[290px] w-full">
            <BarChart
              data={barData}
              margin={{ left: 4, right: 12, top: 30 }}
              barSize={view === "daily" ? (barData.length > 21 ? 9 : 18) : 26}
            >
              <CartesianGrid vertical={false} strokeOpacity={0.3} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={view === "daily" && barData.length > 21 ? 3 : 0}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} width={32} />
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
              >
                <LabelList dataKey="peak" content={<PeakLabel />} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
        </div>
      </div>
    </div>
  );
}
