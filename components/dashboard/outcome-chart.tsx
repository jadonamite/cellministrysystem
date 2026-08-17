"use client";

import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { OutcomeSlice } from "@/lib/data";

const config = {
  answered: { label: "Answered", theme: { light: "#2a78d6", dark: "#3987e5" } },
  no_answer: { label: "No answer", theme: { light: "#eda100", dark: "#c98500" } },
  messaged_only: { label: "Messaged only", theme: { light: "#1baf7a", dark: "#199e70" } },
  not_contacted: { label: "Not yet contacted", theme: { light: "#b3b2a9", dark: "#5c5b54" } },
} satisfies ChartConfig;

export function OutcomeChart({ slices }: { slices: OutcomeSlice[] }) {
  const total = slices.reduce((n, s) => n + s.count, 0);
  const data = slices.map((s) => ({
    ...s,
    fill: `var(--color-${s.outcome})`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Contact outcomes</CardTitle>
        <CardDescription>All {total.toLocaleString()} people in the plan</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-6">
        <ChartContainer config={config} className="aspect-square h-[190px] shrink-0">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="outcome" hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="outcome"
              innerRadius={55}
              strokeWidth={2}
              stroke="var(--background)"
              isAnimationActive={false}
            />
          </PieChart>
        </ChartContainer>
        <ul className="w-full space-y-3">
          {data.map((s) => (
            <li key={s.outcome} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ background: s.fill }}
              />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="ml-auto font-medium tabular-nums">
                {s.count.toLocaleString()}
              </span>
              <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
                {total ? Math.round((s.count / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
