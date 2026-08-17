import { cookies } from "next/headers";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { EVENTS, fmtEventDay, LIVE_EVENT_ID } from "@/lib/events";
import { loadAppData } from "@/lib/page-data";
import { setActiveEvent } from "./actions";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { cn } from "@/lib/utils";

export const metadata = { title: "Events · Outreach Call Center" };

const STATUS_BADGE: Record<string, "default" | "secondary" | "outline"> = {
  live: "default",
  upcoming: "secondary",
  ended: "outline",
};

export default async function EventsPage() {
  const store = await cookies();
  const activeId = store.get("active_event")?.value ?? LIVE_EVENT_ID;
  const { contacts } = await loadAppData();
  const reached = contacts.filter((c) => c.contactedDay !== null).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Events"
        subtitle="Each event runs its own outreach campaign — the dashboard follows the active one"
      >
        <EventFormDialog mode="add" />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {EVENTS.map((e) => {
          const active = e.id === activeId;
          const isLive = e.id === LIVE_EVENT_ID;
          const campaignEnd = new Date(
            new Date(e.campaignStart).getTime() + e.campaignDays * 86_400_000
          );
          const pct = isLive ? Math.min(Math.round((reached / e.target) * 100), 100) : 0;
          return (
            <div
              key={e.id}
              className={cn(
                "card-soft bg-card rounded-3xl p-5 sm:p-6",
                active && "ring-primary ring-2"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{e.name}</h2>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Campaign{" "}
                    {new Date(e.campaignStart).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    })}{" "}
                    –{" "}
                    {campaignEnd.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    })}{" "}
                    · {Math.round(e.campaignDays / 7)} weeks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full" variant={STATUS_BADGE[e.status]}>
                    {e.status}
                  </Badge>
                  {active && (
                    <Badge className="rounded-full" variant="outline">
                      active
                    </Badge>
                  )}
                  <EventFormDialog mode="edit" event={e} />
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <Icon name="events" className="text-muted-foreground size-4 shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Event day
                    </dt>
                    <dd className="font-semibold">{fmtEventDay(e).split(" · ")[0]}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon name="clock" className="text-muted-foreground size-4 shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Time
                    </dt>
                    <dd className="font-semibold">{fmtEventDay(e).split(" · ")[1]}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon name="target" className="text-muted-foreground size-4 shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Reach target
                    </dt>
                    <dd className="font-semibold tabular-nums">
                      {e.target.toLocaleString()} people
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Icon name="user" className="text-muted-foreground size-4 shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      Admin
                    </dt>
                    <dd className="font-semibold">{e.admin}</dd>
                  </div>
                </div>
              </dl>

              {isLive && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">
                      {reached.toLocaleString()} reached
                    </span>
                    <span className="text-primary tabular-nums">{pct}%</span>
                  </div>
                  <div className="bg-secondary mt-1.5 h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}

              <form action={setActiveEvent} className="mt-5">
                <input type="hidden" name="id" value={e.id} />
                <button
                  type="submit"
                  disabled={active}
                  className={cn(
                    "w-full rounded-full py-2.5 text-xs font-bold transition-colors",
                    active
                      ? "bg-secondary text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {active ? "Currently active" : "Open as dashboard"}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground text-xs">
        Create and edit are wired — persistence lands with the e-register
        outreach API, when events become records instead of config.
      </p>
    </div>
  );
}
