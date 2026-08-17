import { cookies } from "next/headers";
import { outreachWired } from "./outreach-api";
import { getEvent } from "./events";
import { generateContacts, dayIndexIn, planWindow, type PlanWindow } from "./data";
import type { Contact, ContactOutcome, GroupNode } from "./types";

/**
 * Live read layer. Contacts + call logs come from the e-register outreach API
 * when wired; the deterministic dummy set backs local dev / an unconfigured API.
 * A contact's dashboard fields (contactedDay, channel, outcome bucket) are
 * derived from its logs so the existing analytics work unchanged.
 */

interface LiveContact {
  id: string;
  name: string;
  phone: string;
  groupId: string;
  broughtBy: string;
  location: string | null;
  createdAt: string | null;
  status: string;
  attempts: number;
  nextFollowUp: string | null;
}

interface LiveLog {
  contactId: string;
  at: string;
  channel: "call" | "message";
  outcome: string;
}

/** A read must never freeze the page: stop waiting after this and fall back. */
const READ_TIMEOUT_MS = 7000;

/**
 * Cached, timeout-guarded GET.
 *
 * Reads are cached in the Data Cache (SWR) and revalidated on demand via
 * `revalidateTag` after a write, so navigation serves from cache instead of a
 * fresh round-trip on the caller's weak link. A `Promise.race` timeout unblocks
 * render if the network stalls — the request keeps warming the cache in the
 * background, but the page never hangs on it. Any failure falls back to null.
 */
async function apiGet<T>(
  path: string,
  opts?: { revalidate?: number; tags?: string[] }
): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Keep a handle so a rejection AFTER the timeout wins the race stays handled.
  const req = fetch(`${process.env.OUTREACH_API}${path}`, {
    headers: { authorization: `Bearer ${process.env.OUTREACH_API_KEY}` },
    next: { revalidate: opts?.revalidate ?? 30, tags: opts?.tags ?? ["outreach"] },
  });
  req.catch(() => {}); // background failure (post-timeout) — never unhandled
  try {
    const res = await Promise.race([
      req,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("read timeout")), READ_TIMEOUT_MS);
      }),
    ]);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * The active event's real (persisted) id. The app's active event is still the
 * static config in lib/events.ts, so we bridge to the DB event by name. Shared
 * by the write path (saves target the right event) and the read path. Null when
 * not wired or no matching persisted event exists.
 */
export async function resolveActiveEventId(): Promise<string | null> {
  if (!outreachWired()) return null;
  const store = await cookies();
  const active = getEvent(store.get("active_event")?.value);
  const events = await apiGet<{ id: string; name: string }[]>("/api/outreach/events", {
    revalidate: 300,
    tags: ["outreach-events"],
  });
  return events?.find((e) => e.name === active.name)?.id ?? null;
}

/** The active event's campaign window (from the static event config). */
export async function activePlanWindow(): Promise<PlanWindow> {
  const store = await cookies();
  return planWindow(getEvent(store.get("active_event")?.value));
}

/** Map a persisted contact + its logs to the dashboard Contact shape. */
function toContact(c: LiveContact, logs: LiveLog[], w: PlanWindow): Contact {
  const latest = [...logs].sort((a, b) => a.at.localeCompare(b.at)).at(-1);
  const contactedDay = latest ? dayIndexIn(w, new Date(latest.at)) : null;

  let outcome: ContactOutcome = "not_contacted";
  if (logs.some((l) => l.outcome === "answered")) outcome = "answered";
  else if (logs.some((l) => l.outcome === "messaged")) outcome = "messaged_only";
  else if (logs.length > 0) outcome = "no_answer";

  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    groupId: c.groupId,
    broughtBy: c.broughtBy,
    location: c.location ?? null,
    contactedDay,
    channel: latest ? latest.channel : null,
    outcome,
    attempts: c.attempts ?? logs.length,
    followUpDay: c.nextFollowUp ? dayIndexIn(w, new Date(c.nextFollowUp)) : null,
  };
}

/**
 * Contacts for the active event. Live from the API when wired (empty until real
 * contacts are collated); the deterministic dummy set otherwise.
 */
export async function loadContacts(roots: GroupNode[]): Promise<Contact[]> {
  const w = await activePlanWindow();
  if (!outreachWired()) return generateContacts(roots, w);

  const eventId = await resolveActiveEventId();
  if (!eventId) return [];

  const [contacts, logs] = await Promise.all([
    apiGet<LiveContact[]>(`/api/outreach/contacts?eventId=${eventId}`),
    apiGet<LiveLog[]>(`/api/outreach/logs?eventId=${eventId}`),
  ]);
  if (!contacts) return [];

  const byContact = new Map<string, LiveLog[]>();
  for (const l of logs ?? []) {
    const arr = byContact.get(l.contactId) ?? [];
    arr.push(l);
    byContact.set(l.contactId, arr);
  }
  return contacts.map((c) => toContact(c, byContact.get(c.id) ?? [], w));
}
