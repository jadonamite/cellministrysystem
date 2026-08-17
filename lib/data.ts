import { ApiGroup, Contact, ContactOutcome, GroupNode } from "./types";
import { ancestryMap } from "./groups";

/**
 * The campaign window for the active event, derived from its config — replaces
 * the old hardcoded plan constants so the dashboard tracks whichever event is
 * active. `start` is UTC midnight of campaignStart (keeps the existing UTC
 * day-labelling correct); `todayIndex` is real "now" clamped into the window.
 */
export interface PlanWindow {
  start: Date;
  days: number;
  weeks: number;
  target: number;
  todayIndex: number;
}

export function planWindow(e: {
  campaignStart: string;
  campaignDays: number;
  target: number;
}): PlanWindow {
  const start = new Date(`${e.campaignStart}T00:00:00Z`);
  const days = Math.max(e.campaignDays, 1);
  const raw = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return {
    start,
    days,
    weeks: Math.ceil(days / 7),
    target: e.target,
    todayIndex: Math.min(Math.max(raw, 0), days - 1),
  };
}

/** Plan-day index of a date within a window (may fall outside 0..days; callers guard). */
export function dayIndexIn(w: PlanWindow, date: Date): number {
  return Math.floor((date.getTime() - w.start.getTime()) / 86_400_000);
}

/** The date at the start of a given plan day. */
export function dateOfDayIn(w: PlanWindow, day: number): Date {
  return new Date(w.start.getTime() + day * 86_400_000);
}

/* ---------- aggregations ---------- */

export interface DailyPoint {
  day: number;
  date: string;
  label: string;
  week: number;
  called: number;
  messaged: number;
}

export function dailySeries(contacts: Contact[], w: PlanWindow): DailyPoint[] {
  const points: DailyPoint[] = Array.from({ length: w.todayIndex + 1 }, (_, d) => {
    const date = dateOfDayIn(w, d);
    return {
      day: d,
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      week: Math.floor(d / 7) + 1,
      called: 0,
      messaged: 0,
    };
  });
  for (const c of contacts) {
    if (c.contactedDay === null) continue;
    const p = points[c.contactedDay];
    if (!p) continue;
    if (c.channel === "call") p.called += 1;
    else p.messaged += 1;
  }
  return points;
}

export interface PacePoint {
  day: number;
  label: string;
  actual: number | null;
  target: number;
}

export function paceSeries(daily: DailyPoint[], w: PlanWindow): PacePoint[] {
  let cum = 0;
  const actualByDay = new Map(daily.map((p) => [p.day, p.called + p.messaged]));
  return Array.from({ length: w.days }, (_, d) => {
    const date = dateOfDayIn(w, d);
    if (d <= w.todayIndex) cum += actualByDay.get(d) ?? 0;
    return {
      day: d,
      label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      actual: d <= w.todayIndex ? cum : null,
      target: Math.round(((d + 1) / w.days) * w.target),
    };
  });
}

export interface GroupStats {
  id: string;
  name: string;
  level: ApiGroup["level"];
  depth: number;
  total: number;
  reached: number;
  called: number;
  messaged: number;
}

/** Roll contact counts up the hierarchy; returns rows in tree order (team → senior cell → cell). */
export function groupRollup(
  groups: ApiGroup[],
  roots: GroupNode[],
  contacts: Contact[]
): GroupStats[] {
  const ancestry = ancestryMap(groups);
  const stats = new Map<string, GroupStats>();
  const ensure = (g: ApiGroup, depth: number) => {
    if (!stats.has(g._id)) {
      stats.set(g._id, {
        id: g._id, name: g.name, level: g.level, depth,
        total: 0, reached: 0, called: 0, messaged: 0,
      });
    }
    return stats.get(g._id)!;
  };

  // register everything in tree order so output is hierarchical
  const rows: GroupStats[] = [];
  const walk = (n: GroupNode, depth: number) => {
    rows.push(ensure(n, depth));
    n.children.forEach((c) => walk(c, depth + 1));
  };
  roots.forEach((r) => walk(r, 0));

  for (const c of contacts) {
    const chain = ancestry.get(c.groupId) ?? [];
    for (const g of chain) {
      const s = stats.get(g._id);
      if (!s) continue;
      s.total += 1;
      if (c.contactedDay !== null) {
        s.reached += 1;
        if (c.channel === "call") s.called += 1;
        else s.messaged += 1;
      }
    }
  }
  return rows;
}

/** all follow-ups due within 3 days (or overdue), oldest first */
export function dueFollowups(contacts: Contact[], w: PlanWindow): Contact[] {
  return contacts
    .filter((c) => c.followUpDay !== null && c.followUpDay <= w.todayIndex + 3)
    .sort((a, b) => (a.followUpDay ?? 0) - (b.followUpDay ?? 0));
}

export interface OutcomeSlice {
  outcome: ContactOutcome;
  label: string;
  count: number;
}

export function outcomeBreakdown(contacts: Contact[]): OutcomeSlice[] {
  const labels: Record<ContactOutcome, string> = {
    answered: "Answered",
    no_answer: "No answer",
    messaged_only: "Messaged only",
    not_contacted: "Not yet contacted",
  };
  const counts = new Map<ContactOutcome, number>();
  for (const c of contacts) counts.set(c.outcome, (counts.get(c.outcome) ?? 0) + 1);
  return (Object.keys(labels) as ContactOutcome[]).map((o) => ({
    outcome: o,
    label: labels[o],
    count: counts.get(o) ?? 0,
  }));
}
