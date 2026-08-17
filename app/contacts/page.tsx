import Link from "next/link";
import { Icon } from "@/components/icons";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/shell/page-header";
import { ListFilters } from "@/components/filters/list-filters";
import { Pagination } from "@/components/filters/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ContactRowActions } from "@/components/contacts/contact-row-actions";
import { ContactCard } from "@/components/contacts/contact-card";
import { CallerBar } from "@/components/caller/caller-bar";
import { CallerGateProvider } from "@/components/caller/caller-gate";
import { getEvent } from "@/lib/events";
import { callerRoster } from "@/lib/callers";
import { getSession } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dateOfDayIn } from "@/lib/data";
import { loadAppData } from "@/lib/page-data";

export const metadata = { title: "Contacts · Outreach Call Center" };

const PAGE_SIZE = 60;

const TABS = [
  { value: "all", label: "All" },
  { value: "answered", label: "Answered" },
  { value: "no_answer", label: "No answer" },
  { value: "messaged_only", label: "Messaged" },
  { value: "not_contacted", label: "Pending" },
];

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const store = await cookies();
  const activeEvent = store.get("active_event")?.value;
  const eventName = getEvent(activeEvent).name;
  const callerName = store.get("caller_name")?.value ?? null;
  const callerSeniorId = store.get("caller_senior_id")?.value || null;
  const callerSeniorName = store.get("caller_senior_name")?.value || null;
  const inviteTemplate = store.get("invite_template")?.value || undefined;
  const roster = await callerRoster();
  const session = await getSession();
  const isAdmin = session?.role === "admin";
  const { contacts, rollup, originOf, colorOf, teamOf, seniorOf, plan } = await loadAppData();
  const teams = rollup
    .filter((r) => r.level === "TEAM")
    .map((t) => ({ id: t.id, name: t.name }));

  // Caller scope: a caller assigned to a senior cell only sees its contacts.
  const scopedContacts = callerSeniorId
    ? contacts.filter((c) => seniorOf[c.groupId] === callerSeniorId)
    : contacts;
  let rows = [...scopedContacts].sort((a, b) => a.name.localeCompare(b.name));
  const status = sp.status ?? "all";
  if (status !== "all") rows = rows.filter((c) => c.outcome === status);
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
        title="Contacts"
        subtitle={`${rows.length.toLocaleString()} of ${scopedContacts.length.toLocaleString()} collated`}
      >
        <Link
          href="/contacts/new"
          className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
        >
          <Icon name="add" className="size-3.5" /> Add contacts
        </Link>
      </PageHeader>

      <CallerGateProvider callerName={callerName} roster={roster}>
      <div className="bg-background/85 sticky top-0 z-20 -mx-4 space-y-3 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <CallerBar />
        {callerSeniorId && (
          <p className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
            <Icon name="teams" className="size-3.5 shrink-0" />
            Showing {callerSeniorName || "your senior cell"} only — your assigned senior cell
          </p>
        )}
        <ListFilters tabs={TABS} teams={teams} />
      </div>

      {/* mobile — call queue */}
      <div className="space-y-2.5 md:hidden">
        {pageRows.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No contacts match these filters.
          </p>
        )}
        {pageRows.map((c) => (
          <ContactCard
            key={c.id}
            contact={{ id: c.id, name: c.name, phone: c.phone, broughtBy: c.broughtBy, location: c.location }}
            origin={originOf[c.groupId] ?? "—"}
            color={colorOf[c.groupId]}
            outcome={c.outcome}
            lastContact={
              c.contactedDay !== null
                ? dateOfDayIn(plan, c.contactedDay).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  })
                : "Not yet"
            }
            eventName={eventName}
            inviteTemplate={inviteTemplate}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* desktop — admin table */}
      <div className="card-soft bg-card hidden rounded-3xl p-5 sm:p-6 md:block">
        <div className="scroll-x">
          <div className="min-w-[960px]">
            <Table className="sticky-first">
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Brought by</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last contact</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                      No contacts match these filters.
                    </TableCell>
                  </TableRow>
                )}
                {pageRows.map((c) => {
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
                        {c.location ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Icon name="pin" className="size-3.5 shrink-0 opacity-70" />
                            {c.location}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.broughtBy}
                      </TableCell>
                      <TableCell>
                        <StatusBadge outcome={c.outcome} />
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {c.contactedDay !== null
                          ? dateOfDayIn(plan, c.contactedDay).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              timeZone: "UTC",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <ContactRowActions
                          contact={{ id: c.id, name: c.name, phone: c.phone }}
                          eventName={eventName}
                          inviteTemplate={inviteTemplate}
                          isAdmin={isAdmin}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/contacts"
        params={params}
      />
      </CallerGateProvider>
    </div>
  );
}
