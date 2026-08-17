import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { FollowupTable } from "@/components/dashboard/followup-table";
import { TeamActivityChart } from "@/components/dashboard/team-activity-chart";
import { dailySeries, dueFollowups } from "@/lib/data";
import { loadAppData } from "@/lib/page-data";

export const metadata = { title: "Team · Outreach Call Center" };

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { rollup, contacts, teamColorOf, originOf, colorOf, teamOf, plan } =
    await loadAppData();

  const team = rollup.find((r) => r.id === id && r.level === "TEAM");
  if (!team) notFound();

  const color = teamColorOf[team.id];
  const coverage = team.total ? Math.round((team.reached / team.total) * 100) : 0;

  // the team's block in tree order (team row + its senior cells + cells)
  const start = rollup.findIndex((r) => r.id === team.id);
  let end = start + 1;
  while (end < rollup.length && rollup[end].depth > 0) end++;
  const block = rollup.slice(start, end);

  const teamContacts = contacts.filter((c) => teamOf[c.groupId] === team.id);
  const teamDaily = dailySeries(teamContacts, plan);
  const teamDue = dueFollowups(teamContacts, plan);

  const tiles = [
    { label: "Collated", value: team.total },
    { label: "Reached", value: team.reached },
    { label: "Called", value: team.called },
    { label: "Messaged", value: team.messaged },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title={team.name} subtitle="Team drill-down">
        <span
          className="rounded-full px-4 py-2 text-[11px] font-bold tracking-widest uppercase"
          style={{
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
            color,
          }}
        >
          {coverage}% coverage
        </span>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card-soft bg-card relative overflow-hidden rounded-3xl p-5">
            <span
              className="absolute inset-y-0 left-0 w-1"
              style={{ background: color }}
            />
            <p className="text-2xl leading-none font-bold tabular-nums">
              {t.value.toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-2 text-[10px] font-bold tracking-widest uppercase">
              {t.label}
            </p>
          </div>
        ))}
      </div>

      <TeamActivityChart daily={teamDaily} color={color} />

      <Leaderboard
        rows={block}
        teamColorOf={teamColorOf}
        title="Cells breakdown"
        subtitle="Senior cells and cells inside this team"
        hideRank
      />

      <FollowupTable
        rows={teamDue.slice(0, 15)}
        originOf={originOf}
        colorOf={colorOf}
        plan={plan}
        subtitle={`${teamDue.length} due in this team — showing the 15 oldest`}
        viewAllHref={`/follow-ups?team=${team.id}`}
      />
    </div>
  );
}
