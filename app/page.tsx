import { cookies } from "next/headers";
import { Icon } from "@/components/icons";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { PageHeader } from "@/components/shell/page-header";
import { fmtEventDay, getEvent, LIVE_EVENT_ID } from "@/lib/events";
import { StatCards, type Stat } from "@/components/dashboard/stat-cards";
import { OutreachChart } from "@/components/dashboard/outreach-chart";
import { TeamDonut, type TeamSlice } from "@/components/dashboard/team-donut";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import {
  CollationReportProvider,
  CollationDownloadButton,
} from "@/components/dashboard/collation-report";
import { FollowupTable } from "@/components/dashboard/followup-table";
import { ancestryMap, buildTree, getGroups } from "@/lib/groups";
import { teamColorMap } from "@/lib/team-colors";
import {
  dailySeries,
  dueFollowups,
  groupRollup,
  outcomeBreakdown,
  paceSeries,
  planWindow,
} from "@/lib/data";
import { loadContacts } from "@/lib/live-data";

export default async function DashboardPage() {
  const store = await cookies();
  const adminName = store.get("admin_name")?.value ?? "Admin";
  const activeEvent = getEvent(store.get("active_event")?.value);

  // an event whose campaign hasn't started yet has nothing to aggregate
  if (activeEvent.id !== LIVE_EVENT_ID) {
    const daysToCampaign = Math.max(
      Math.ceil(
        (new Date(activeEvent.campaignStart).getTime() - Date.now()) / 86_400_000
      ),
      0
    );
    return (
      <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader title={`Hello, ${adminName} 👋`} subtitle={activeEvent.name} />
        <div className="card-soft bg-card flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center">
          <span className="bg-accent text-accent-foreground flex size-12 items-center justify-center rounded-2xl">
            <Icon name="events" className="size-5" />
          </span>
          <h2 className="text-lg font-bold">{activeEvent.name}</h2>
          <p className="text-muted-foreground max-w-md text-sm">
            {fmtEventDay(activeEvent)} · target{" "}
            {activeEvent.target.toLocaleString()} people · admin{" "}
            {activeEvent.admin}. Collation opens with the campaign in{" "}
            <b>{daysToCampaign} days</b> — nothing to aggregate yet.
          </p>
          <Link
            href="/events"
            className="bg-primary text-primary-foreground mt-2 rounded-full px-5 py-2.5 text-xs font-bold"
          >
            Switch event
          </Link>
        </div>
      </div>
    );
  }

  const groups = await getGroups();
  const roots = buildTree(groups);
  const plan = planWindow(activeEvent);
  const contacts = await loadContacts(roots);

  const daily = dailySeries(contacts, plan);
  const pace = paceSeries(daily, plan);
  const rollup = groupRollup(groups, roots, contacts);
  const outcomes = outcomeBreakdown(contacts);
  const teamColorOf = teamColorMap(groups);

  const reached = contacts.filter((c) => c.contactedDay !== null);
  const called = reached.filter((c) => c.channel === "call");
  const answered = reached.filter((c) => c.outcome === "answered");
  const messagedNotCalled = reached.filter((c) => c.channel === "message");
  const followupsDue = contacts.filter(
    (c) => c.followUpDay !== null && c.followUpDay <= plan.todayIndex
  );

  const week = Math.min(Math.floor(plan.todayIndex / 7) + 1, plan.weeks);
  const targetToDate = Math.round(((plan.todayIndex + 1) / plan.days) * plan.target);
  const paceDelta = reached.length - targetToDate;

  // sparklines: the last 7 days of activity
  const last7 = daily.slice(-7);
  const sparkReached = last7.map((d) => d.called + d.messaged);
  const sparkCalled = last7.map((d) => d.called);
  const sparkMessaged = last7.map((d) => d.messaged);

  const stats: Stat[] = [
    {
      label: "People reached",
      value: reached.length.toLocaleString(),
      hint: `${paceDelta >= 0 ? "+" : ""}${paceDelta} vs plan target of ${targetToDate}`,
      icon: "reached",
      spark: sparkReached,
      hero: true,
    },
    {
      label: "Total called",
      value: called.length.toLocaleString(),
      hint: `${answered.length} answered`,
      icon: "called",
      spark: sparkCalled,
    },
    {
      label: "Messaged, not called",
      value: messagedNotCalled.length.toLocaleString(),
      hint: "reached by message only",
      icon: "messaged",
      spark: sparkMessaged,
    },
    {
      label: "Connect rate",
      value: called.length
        ? `${Math.round((answered.length / called.length) * 100)}%`
        : "—",
      hint: "answered ÷ calls made",
      icon: "connect",
    },
    {
      label: "Follow-ups due",
      value: followupsDue.length.toLocaleString(),
      hint: "due today or overdue",
      icon: "followup",
      trend: "down",
    },
  ];

  // group id → origin label and team color
  const ancestry = ancestryMap(groups);
  const originOf: Record<string, string> = {};
  const colorOf: Record<string, string> = {};
  for (const [id, chain] of ancestry) {
    const team = chain[chain.length - 1];
    originOf[id] =
      chain.length > 1 ? `${chain[0].name} · ${team.name}` : chain[0].name;
    colorOf[id] = teamColorOf[team._id];
  }

  const teamSlices: TeamSlice[] = rollup
    .filter((r) => r.level === "TEAM")
    .sort((a, b) => b.total - a.total)
    .map((t) => ({ id: t.id, name: t.name, total: t.total, color: teamColorOf[t.id] }));

  const due = dueFollowups(contacts, plan);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <DashboardHeader
        adminName={adminName}
        eventName={activeEvent.name}
        week={week}
        totalWeeks={plan.weeks}
        contacts={contacts.length}
        teams={roots.length}
        target={plan.target}
      />

      {/* Event progress — the sidebar card is desktop-only, so surface it on mobile here. */}
      <div className="card-soft bg-card flex items-center gap-4 rounded-3xl p-4 md:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-widest uppercase opacity-60">
            Event in {Math.max(plan.days - plan.todayIndex - 1, 0)} day
            {Math.max(plan.days - plan.todayIndex - 1, 0) === 1 ? "" : "s"}
          </p>
          <p className="mt-1.5 text-lg leading-none font-bold tabular-nums">
            {reached.length.toLocaleString()}
            <span className="text-muted-foreground text-xs font-semibold">
              {" "}/ {plan.target.toLocaleString()} reached
            </span>
          </p>
          <div className="bg-secondary mt-2.5 h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${Math.min(Math.round((reached.length / plan.target) * 100), 100)}%` }}
            />
          </div>
        </div>
        <span className="text-primary text-2xl leading-none font-bold tabular-nums">
          {Math.min(Math.round((reached.length / plan.target) * 100), 100)}%
        </span>
      </div>

      <StatCards stats={stats} />

      <CollationReportProvider
        eventName={activeEvent.name}
        dateLabel={fmtEventDay(activeEvent)}
        teams={teamSlices}
        outcomes={outcomes}
        rollup={rollup}
        teamColorOf={teamColorOf}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <OutreachChart daily={daily} pace={pace} planWeeks={plan.weeks} />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <TeamDonut teams={teamSlices} outcomes={outcomes} />
            <div className="flex justify-end">
              <CollationDownloadButton kind="collation" label="Download collation" />
            </div>
          </div>
        </div>

        <Leaderboard rows={rollup} teamColorOf={teamColorOf} viewAllHref="/teams" />
        <div className="flex justify-end">
          <CollationDownloadButton kind="standings" label="Download standings" />
        </div>
      </CollationReportProvider>

      <FollowupTable
        rows={due.slice(0, 10)}
        originOf={originOf}
        colorOf={colorOf}
        plan={plan}
        subtitle={`${due.length} due or overdue — showing the 10 oldest`}
        viewAllHref="/follow-ups"
      />
    </div>
  );
}
