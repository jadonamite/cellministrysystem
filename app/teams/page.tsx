import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/shell/page-header";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { loadAppData } from "@/lib/page-data";

export const metadata = { title: "Teams · Outreach Call Center" };

export default async function TeamsPage() {
  const { rollup, teamColorOf } = await loadAppData();
  const teams = rollup
    .filter((r) => r.level === "TEAM")
    .sort((a, b) => b.reached - a.reached);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Teams"
        subtitle="Every team's collation and coverage, cells included"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((t, i) => {
          const color = teamColorOf[t.id];
          const coverage = t.total ? Math.round((t.reached / t.total) * 100) : 0;
          return (
            <Link
              key={t.id}
              href={`/teams/${t.id}`}
              className="card-soft bg-card group relative overflow-hidden rounded-3xl p-5 transition-transform hover:-translate-y-0.5"
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
                  <span className="font-bold">{t.name}</span>
                  <span className="text-muted-foreground text-xs font-bold">
                    #{i + 1}
                  </span>
                </span>
                <Icon name="arrow-up-right" className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-2xl leading-none font-bold tabular-nums">
                    {t.total.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    collated · {t.reached.toLocaleString()} reached
                  </p>
                </div>
                <p className="text-sm font-bold tabular-nums" style={{ color }}>
                  {coverage}%
                </p>
              </div>
              <div className="bg-secondary mt-3 h-2 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${coverage}%`, background: color }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      <Leaderboard rows={rollup} teamColorOf={teamColorOf} title="Full standings" />
    </div>
  );
}
