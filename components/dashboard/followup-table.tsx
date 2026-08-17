import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { dateOfDayIn, type PlanWindow } from "@/lib/data";
import type { Contact } from "@/lib/types";

interface Props {
  rows: Contact[];
  /** group id → "Cell · Team" origin label */
  originOf: Record<string, string>;
  /** group id → its team's css color */
  colorOf: Record<string, string>;
  /** active event's campaign window (day labelling + overdue) */
  plan: PlanWindow;
  title?: string;
  subtitle?: string;
  /** show a "view all" link (dashboard preview mode) */
  viewAllHref?: string;
}

function fmt(plan: PlanWindow, day: number) {
  return dateOfDayIn(plan, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function FollowupTable({
  rows,
  originOf,
  colorOf,
  plan,
  title = "Follow-up queue",
  subtitle,
  viewAllHref,
}: Props) {
  return (
    <div className="card-soft bg-card rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-primary text-xs font-bold whitespace-nowrap hover:underline"
          >
            View all →
          </Link>
        )}
      </div>
      <div className="scroll-x mt-4">
        <div className="min-w-[820px]">
          <Table className="sticky-first">
            <TableHeader>
              <TableRow className="border-none">
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Brought by</TableHead>
                <TableHead>Last contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                    Nothing due — all caught up.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((c) => {
                const overdue = (c.followUpDay ?? 0) < plan.todayIndex;
                const color = colorOf[c.groupId];
                return (
                  <TableRow key={c.id} className="border-border/60">
                    <TableCell className="font-semibold">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs tabular-nums">
                      {c.phone}
                    </TableCell>
                    <TableCell>
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
                        style={{
                          background: `color-mix(in srgb, ${color} 13%, transparent)`,
                          color,
                        }}
                      >
                        {originOf[c.groupId] ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.broughtBy}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {c.contactedDay !== null ? fmt(plan, c.contactedDay) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge outcome={c.outcome} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={overdue ? "text-destructive font-semibold" : ""}>
                        {c.followUpDay !== null ? fmt(plan, c.followUpDay) : "—"}
                        {overdue && " · overdue"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
