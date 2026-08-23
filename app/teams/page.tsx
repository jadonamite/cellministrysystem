import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/shell/page-header";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { loadAppData } from "@/lib/page-data";

export const metadata = { title: "Hierarchy Tree · Cell Ministry System" };

export default async function TeamsPage() {
  const { rollup, teamColorOf } = await loadAppData();
  const teams = rollup
    .filter((r) => r.depth === 0)
    .sort((a, b) => b.reached - a.reached);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>Structural Organization</span>
          <span>·</span>
          <span className="font-serif italic text-purple-600 dark:text-purple-400 text-sm">
            you are on a course
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
          Ministry Hierarchy Tree
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs">
          Every ministry team's collation, senior cells, and cell unit coverage
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((t, i) => {
          const color = teamColorOf[t.id];
          const coverage = t.total ? Math.round((t.reached / t.total) * 100) : 0;
          return (
            <Link
              key={t.id}
              href={`/teams/${t.id}`}
              className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/85 p-6 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-zinc-900/60 transition-all hover:-translate-y-0.5 hover:border-purple-500/30"
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: color }}
              />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="font-bold text-zinc-950 dark:text-white">{t.name}</span>
                  <span className="text-zinc-400 text-xs font-bold">
                    #{i + 1}
                  </span>
                </span>
                <Icon name="arrow-up-right" className="text-zinc-400 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-3xl leading-none font-extrabold text-zinc-950 dark:text-white tabular-nums">
                    {t.total.toLocaleString()}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs">
                    collated · {t.reached.toLocaleString()} reached
                  </p>
                </div>
                <p className="text-sm font-bold tabular-nums" style={{ color }}>
                  {coverage}%
                </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 mt-3 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${coverage}%`, background: color }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      <Leaderboard rows={rollup} teamColorOf={teamColorOf} title="Full Ministry Standings" />
    </div>
  );
}
