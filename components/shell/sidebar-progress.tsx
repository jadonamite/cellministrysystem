import { buildTree, getGroups } from "@/lib/groups";
import { loadContacts, activePlanWindow } from "@/lib/live-data";

/**
 * The sidebar's "reach so far" card. Isolated into its own async component so
 * the heavy all-contacts load it needs streams in via <Suspense> instead of
 * blocking the whole app shell (and every navigation) behind it.
 */
export async function SidebarProgress() {
  const plan = await activePlanWindow();
  const groups = await getGroups();
  const contacts = await loadContacts(buildTree(groups));
  const reached = contacts.filter((c) => c.contactedDay !== null).length;
  const target = plan.target;
  const daysLeft = Math.max(plan.days - plan.todayIndex - 1, 0);
  const pct = Math.min(Math.round((reached / target) * 100), 100);

  return (
    <div className="bg-secondary/60 rounded-2xl p-4">
      <p className="text-[10px] font-bold tracking-widest uppercase opacity-60">
        Event in {daysLeft} day{daysLeft === 1 ? "" : "s"}
      </p>
      <p className="mt-2 text-lg leading-none font-bold tabular-nums">
        {reached.toLocaleString()}
        <span className="text-muted-foreground text-xs font-semibold">
          {" "}/ {target.toLocaleString()}
        </span>
      </p>
      <div className="bg-background mt-3 h-2 w-full overflow-hidden rounded-full">
        <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-muted-foreground mt-2 text-xs font-medium">{pct}% of reach target</p>
    </div>
  );
}

/** Matching placeholder shown while the card streams. */
export function SidebarProgressSkeleton() {
  return (
    <div className="bg-secondary/60 rounded-2xl p-4">
      <div className="bg-background/60 h-2.5 w-24 animate-pulse rounded" />
      <div className="bg-background/60 mt-3 h-5 w-20 animate-pulse rounded" />
      <div className="bg-background mt-3 h-2 w-full animate-pulse rounded-full" />
      <div className="bg-background/60 mt-2 h-3 w-28 animate-pulse rounded" />
    </div>
  );
}
