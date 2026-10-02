import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { FollowupTable } from "@/components/dashboard/followup-table";
import { TeamActivityChart } from "@/components/dashboard/team-activity-chart";
import { dailySeries, dueFollowups } from "@/lib/data";
import { loadAppData } from "@/lib/page-data";

export const metadata = { title: "Ministry Team · Cell Ministry System" };

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { rollup, contacts, teamColorOf, originOf, colorOf, teamOf, plan } =
    await loadAppData();

  const team = rollup.find((r) => r.id === id && r.depth === 0);
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
    { label: "Total Collated", value: team.total },
    { label: "Souls Reached", value: team.reached },
    { label: "Calls Connected", value: team.called },
    { label: "Messages Sent", value: team.messaged },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Ministry Team Drill-down</span>
            <span>·</span>
            <span className="font-serif italic text-purple-600 dark:text-purple-400 text-sm">
              you are on a course
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            {team.name}
          </h1>
        </div>

        <span
          className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider border"
          style={{
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
            color,
          }}
        >
          {coverage}% coverage
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/85 p-6 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-zinc-900/60">
            <span
              className="absolute inset-y-0 left-0 w-1"
              style={{ background: color }}
            />
            <p className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white tabular-nums">
              {t.value.toLocaleString()}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-xs font-bold uppercase tracking-wider">
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
