import Link from "next/link";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/shell/page-header";
import { FollowupTable } from "@/components/dashboard/followup-table";
import { ListFilters } from "@/components/filters/list-filters";
import { Pagination } from "@/components/filters/pagination";
import { dueFollowups } from "@/lib/data";
import { loadAppData } from "@/lib/page-data";

export const metadata = { title: "Follow-ups · Outreach Call Center" };

const PAGE_SIZE = 50;

const TABS = [
  { value: "all", label: "All due" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "upcoming", label: "Upcoming" },
];

export default async function FollowupsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { contacts, rollup, originOf, colorOf, teamOf, plan } = await loadAppData();
  const teams = rollup
    .filter((r) => r.level === "TEAM")
    .map((t) => ({ id: t.id, name: t.name }));

  let rows = dueFollowups(contacts, plan);
  const status = sp.status ?? "all";
  if (status === "overdue") rows = rows.filter((c) => (c.followUpDay ?? 0) < plan.todayIndex);
  if (status === "today") rows = rows.filter((c) => c.followUpDay === plan.todayIndex);
  if (status === "upcoming") rows = rows.filter((c) => (c.followUpDay ?? 0) > plan.todayIndex);
  if (sp.team) rows = rows.filter((c) => teamOf[c.groupId] === sp.team);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    rows = rows.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }

  const totalPages = Math.max(Math.ceil(rows.length / PAGE_SIZE), 1);
  const page = Math.min(Math.max(Number(sp.page) || 1, 1), totalPages);
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const params = new URLSearchParams();
  for (const k of ["status", "team", "q"]) if (sp[k]) params.set(k, sp[k]!);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Follow-ups"
        subtitle={`${rows.length.toLocaleString()} match your filters`}
      >
        <Link
          href="/messages"
          className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
        >
          <Icon name="sms" className="size-3.5" /> Send SMS
        </Link>
      </PageHeader>
      <ListFilters tabs={TABS} teams={teams} />
      <FollowupTable
        rows={pageRows}
        originOf={originOf}
        colorOf={colorOf}
        plan={plan}
        title="Queue"
        subtitle="Oldest due date first"
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/follow-ups"
        params={params}
      />
    </div>
  );
}
