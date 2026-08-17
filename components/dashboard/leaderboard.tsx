"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { GroupStats } from "@/lib/data";

const LEVEL_LABEL: Record<GroupStats["level"], string> = {
  TEAM: "Team",
  SENIOR_CELL: "Senior cell",
  CELL: "Cell",
};

interface Props {
  rows: GroupStats[];
  /** team id → css color; child rows inherit their team's hue */
  teamColorOf: Record<string, string>;
  title?: string;
  subtitle?: string;
  viewAllHref?: string;
  /** hide the rank column (single-team pages) */
  hideRank?: boolean;
  /**
   * Static, non-interactive render for the downloadable report: teams and their
   * senior cells show, cells stay collapsed. Chevrons render in their resting
   * state but nothing is clickable.
   */
  readOnly?: boolean;
}

/** A team with its senior cells, each carrying its own cells (rebuilt from the flat, tree-ordered rows). */
interface TeamBlock {
  team: GroupStats;
  seniors: { senior: GroupStats; cells: GroupStats[] }[];
}

function toBlocks(rows: GroupStats[]): TeamBlock[] {
  const blocks: TeamBlock[] = [];
  for (const r of rows) {
    if (r.depth === 0) {
      blocks.push({ team: r, seniors: [] });
    } else if (r.depth === 1) {
      blocks[blocks.length - 1]?.seniors.push({ senior: r, cells: [] });
    } else {
      const b = blocks[blocks.length - 1];
      b?.seniors[b.seniors.length - 1]?.cells.push(r);
    }
  }
  return blocks;
}

export function Leaderboard({
  rows,
  teamColorOf,
  title = "Team standings",
  subtitle = "Contacts collated per team, rolled up through senior cells and cells — tap a team or senior cell to drill in",
  viewAllHref,
  hideRank = false,
  readOnly = false,
}: Props) {
  // Default: teams expanded (senior cells visible), senior cells collapsed (cells hidden).
  const [collapsedTeams, setCollapsedTeams] = useState<Set<string>>(new Set());
  const [expandedSeniors, setExpandedSeniors] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  const blocks = toBlocks(rows);
  const teams = blocks.map((b) => b.team);
  const ranked = [...teams].sort((a, b) => b.reached - a.reached);
  const rankOf = new Map(ranked.map((t, i) => [t.id, i + 1]));
  blocks.sort((a, b) => (rankOf.get(a.team.id) ?? 99) - (rankOf.get(b.team.id) ?? 99));

  const colCount = 6 + (hideRank ? 0 : 1);

  function metricCells(r: GroupStats, teamColor: string) {
    const coverage = r.total ? Math.round((r.reached / r.total) * 100) : 0;
    return (
      <>
        <TableCell className="text-right font-bold tabular-nums">
          {r.total.toLocaleString()}
        </TableCell>
        <TableCell className="text-right font-medium tabular-nums">
          {r.reached.toLocaleString()}
        </TableCell>
        <TableCell className="text-muted-foreground text-right tabular-nums">
          {r.called.toLocaleString()}
        </TableCell>
        <TableCell className="text-muted-foreground text-right tabular-nums">
          {r.messaged.toLocaleString()}
        </TableCell>
        <TableCell className="rounded-r-2xl">
          <div className="flex items-center gap-2">
            <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full"
                style={{ width: `${coverage}%`, background: teamColor }}
              />
            </div>
            <span className="text-muted-foreground w-9 text-right text-xs font-semibold tabular-nums">
              {coverage}%
            </span>
          </div>
        </TableCell>
      </>
    );
  }

  return (
    <div className="card-soft bg-card rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
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
        <div className="min-w-[840px]">
          <Table className="sticky-first">
            <TableHeader>
              <TableRow className="border-none">
                {!hideRank && <TableHead className="w-12">Rank</TableHead>}
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Collated</TableHead>
                <TableHead className="text-right">Reached</TableHead>
                <TableHead className="text-right">Called</TableHead>
                <TableHead className="text-right">Messaged</TableHead>
                <TableHead className="w-[190px]">Coverage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map(({ team, seniors }) => {
                const teamColor = teamColorOf[team.id];
                // readOnly: teams always expanded (senior cells show), non-interactive.
                const teamOpen = readOnly || !collapsedTeams.has(team.id);
                return (
                  <FragmentRows key={team.id}>
                    {/* team row */}
                    <TableRow
                      className={cn("border-border/60", !readOnly && "cursor-pointer")}
                      style={{ background: `color-mix(in srgb, ${teamColor} 7%, transparent)` }}
                      onClick={
                        readOnly
                          ? undefined
                          : () => setCollapsedTeams((s) => toggle(s, team.id))
                      }
                    >
                      {!hideRank && (
                        <TableCell className="text-muted-foreground rounded-l-2xl font-bold tabular-nums">
                          #{rankOf.get(team.id)}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Icon name="chevron-right"
                            className={cn(
                              "text-muted-foreground size-4 shrink-0 transition-transform",
                              teamOpen && "rotate-90"
                            )}
                          />
                          <span className="size-2.5 shrink-0 rounded-full" style={{ background: teamColor }} />
                          <Link
                            href={`/teams/${team.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold hover:underline"
                          >
                            {team.name}
                          </Link>
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                            style={{
                              background: `color-mix(in srgb, ${teamColor} 14%, transparent)`,
                              color: teamColor,
                            }}
                          >
                            {LEVEL_LABEL.TEAM}
                          </span>
                        </div>
                      </TableCell>
                      {metricCells(team, teamColor)}
                    </TableRow>

                    {/* senior cells */}
                    {teamOpen &&
                      seniors.map(({ senior, cells }) => {
                        // readOnly: cells always collapsed, non-interactive.
                        const seniorOpen = !readOnly && expandedSeniors.has(senior.id);
                        const seniorClickable = !readOnly && cells.length > 0;
                        return (
                          <FragmentRows key={senior.id}>
                            <TableRow
                              className={cn(
                                "border-border/60",
                                seniorClickable && "cursor-pointer"
                              )}
                              onClick={
                                seniorClickable
                                  ? () => setExpandedSeniors((s) => toggle(s, senior.id))
                                  : undefined
                              }
                            >
                              {!hideRank && <TableCell className="rounded-l-2xl" />}
                              <TableCell>
                                <div className="flex items-center gap-2.5" style={{ paddingLeft: "20px" }}>
                                  {cells.length > 0 ? (
                                    <Icon name="chevron-right"
                                      className={cn(
                                        "text-muted-foreground size-3.5 shrink-0 transition-transform",
                                        seniorOpen && "rotate-90"
                                      )}
                                    />
                                  ) : (
                                    <span className="size-3.5 shrink-0" />
                                  )}
                                  <span
                                    className="size-1.5 shrink-0 rounded-full opacity-60"
                                    style={{ background: teamColor }}
                                  />
                                  <span className="font-medium">{senior.name}</span>
                                  <span
                                    className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                                    style={{
                                      background: `color-mix(in srgb, ${teamColor} 14%, transparent)`,
                                      color: teamColor,
                                    }}
                                  >
                                    {LEVEL_LABEL.SENIOR_CELL}
                                  </span>
                                </div>
                              </TableCell>
                              {metricCells(senior, teamColor)}
                            </TableRow>

                            {/* cells */}
                            {seniorOpen &&
                              cells.map((cell) => (
                                <TableRow key={cell.id} className="border-border/60">
                                  {!hideRank && <TableCell className="rounded-l-2xl" />}
                                  <TableCell>
                                    <div className="flex items-center gap-2.5" style={{ paddingLeft: "40px" }}>
                                      <span className="size-3.5 shrink-0" />
                                      <span
                                        className="size-1.5 shrink-0 rounded-full opacity-60"
                                        style={{ background: teamColor }}
                                      />
                                      <span className="font-medium">{cell.name}</span>
                                      <span
                                        className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase"
                                        style={{
                                          background: `color-mix(in srgb, ${teamColor} 14%, transparent)`,
                                          color: teamColor,
                                        }}
                                      >
                                        {LEVEL_LABEL.CELL}
                                      </span>
                                    </div>
                                  </TableCell>
                                  {metricCells(cell, teamColor)}
                                </TableRow>
                              ))}
                          </FragmentRows>
                        );
                      })}
                  </FragmentRows>
                );
              })}
              {blocks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={colCount} className="text-muted-foreground py-8 text-center">
                    No teams yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

/** Groups sibling <tr>s without a wrapper element (tbody can't hold fragments' keys otherwise). */
function FragmentRows({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
