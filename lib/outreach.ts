/**
 * Finalized call-tracking domain (the flow locked with Jadon on 2026-07-03).
 *
 * This is deliberately separate from the dummy-dashboard model in `lib/data.ts`
 * / `lib/types.ts`. That model backs the read-only analytics off deterministic
 * fake data; THIS is the write-path the outreach API will persist. When the
 * `/api/outreach/*` endpoints land, the stub actions swap their persistence
 * line for a `fetch()` and everything below stays as the shared contract.
 *
 * A contact's status is never stored — it is DERIVED from its logs (+ event-day
 * check-in), so history stays the single source of truth.
 */

/** What happened on the line for a single attempt. */
export type CallOutcome =
  | "answered"
  | "no_answer"
  | "switched_off"
  | "busy"
  | "wrong_number"
  | "messaged";

/** If we reached the person (answered/messaged), what they said. */
export type Disposition = "coming" | "not_coming" | "call_back_later";

export type Channel = "call" | "message";

/**
 * Derived pipeline position. The first five are the forward funnel; the last
 * two are exits that pull a contact out of the active queue.
 */
export type ContactStatus =
  | "pending" // never attempted
  | "attempted" // tried, not yet reached (no_answer/busy/switched_off)
  | "reached" // spoke to / messaged the person
  | "confirmed" // they said they're coming
  | "attended" // checked in on event day (from e-register)
  | "wrong_number" // exit → per-cell fix list
  | "do_not_contact"; // exit → suppressed

export interface Caller {
  id: string;
  name: string;
  active: boolean;
}

export interface OutreachContact {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  /** leaf group (cell) credited with bringing this contact */
  groupId: string;
  broughtBy: string;
  createdAt: string; // ISO
}

export interface OutreachLog {
  id: string;
  contactId: string;
  callerId: string;
  at: string; // ISO timestamp of the attempt
  channel: Channel;
  outcome: CallOutcome;
  /** present only when the person was reached */
  disposition?: Disposition;
  /** ISO date the contact asked to be called back (disposition call_back_later) */
  callBackAt?: string;
  note?: string;
}

/* ---------- outcome metadata (labels + which outcomes reached a person) ---------- */

export const CALL_OUTCOMES: Record<CallOutcome, { label: string; reached: boolean; channel: Channel }> = {
  answered: { label: "Answered", reached: true, channel: "call" },
  messaged: { label: "Messaged", reached: true, channel: "message" },
  no_answer: { label: "No answer", reached: false, channel: "call" },
  busy: { label: "Busy", reached: false, channel: "call" },
  switched_off: { label: "Switched off", reached: false, channel: "call" },
  wrong_number: { label: "Wrong number", reached: false, channel: "call" },
};

export const DISPOSITIONS: Record<Disposition, string> = {
  coming: "Coming",
  not_coming: "Not coming",
  call_back_later: "Call back later",
};

export const STATUS_META: Record<ContactStatus, { label: string; team: number }> = {
  pending: { label: "Pending", team: 0 },
  attempted: { label: "Attempted", team: 5 },
  reached: { label: "Reached", team: 1 },
  confirmed: { label: "Confirmed", team: 2 },
  attended: { label: "Attended", team: 2 },
  wrong_number: { label: "Wrong number", team: 4 },
  do_not_contact: { label: "Do not contact", team: 4 },
};

/* ---------- derivation ---------- */

/** Auto follow-up offsets, in days, keyed by the outcome that triggers them. */
const FOLLOWUP_DAYS: Partial<Record<CallOutcome, number>> = {
  no_answer: 2,
  busy: 2,
  switched_off: 2,
  messaged: 3,
};

/** How many distinct failed-attempt days before a contact goes to the cold list. */
export const COLD_AFTER_DISTINCT_DAYS = 3;

/**
 * Derive a contact's pipeline status from its logs (newest-last order is not
 * required — we scan all). `attended` overrides everything; the two exits win
 * over the forward funnel.
 */
export function deriveStatus(
  logs: OutreachLog[],
  opts: { attended?: boolean; doNotContact?: boolean } = {}
): ContactStatus {
  if (opts.attended) return "attended";
  if (opts.doNotContact) return "do_not_contact";
  if (logs.some((l) => l.outcome === "wrong_number")) return "wrong_number";
  if (logs.length === 0) return "pending";

  let reached = false;
  let confirmed = false;
  for (const l of logs) {
    if (CALL_OUTCOMES[l.outcome]?.reached) reached = true;
    if (l.disposition === "coming") confirmed = true;
    // an explicit "not coming" after a later "coming" is handled by chronology
    // at the caller's discretion; latest-wins is applied below.
  }
  // latest disposition wins for the coming/not-coming distinction
  const latestDisposed = [...logs]
    .filter((l) => l.disposition)
    .sort((a, b) => a.at.localeCompare(b.at))
    .at(-1);
  if (latestDisposed?.disposition === "coming") return "confirmed";
  if (confirmed && latestDisposed?.disposition !== "not_coming") return "confirmed";
  if (reached) return "reached";
  return "attempted";
}

/**
 * Next scheduled follow-up date for a contact, or null if none is due.
 * call_back_later uses the caller-given date; otherwise the newest failed/
 * messaged attempt sets the offset. A "coming"/"not_coming" disposition closes
 * the loop (no auto follow-up).
 */
export function nextFollowUp(logs: OutreachLog[]): Date | null {
  if (logs.length === 0) return null;
  const latest = [...logs].sort((a, b) => a.at.localeCompare(b.at)).at(-1)!;

  if (latest.disposition === "coming" || latest.disposition === "not_coming") return null;
  if (latest.disposition === "call_back_later" && latest.callBackAt) {
    return new Date(latest.callBackAt);
  }
  const offset = FOLLOWUP_DAYS[latest.outcome];
  if (offset == null) return null;
  const base = new Date(latest.at);
  base.setDate(base.getDate() + offset);
  return base;
}

/** A contact is "cold" once it has failed attempts on COLD_AFTER_DISTINCT_DAYS distinct days without ever being reached. */
export function isCold(logs: OutreachLog[]): boolean {
  if (logs.some((l) => CALL_OUTCOMES[l.outcome]?.reached)) return false;
  const days = new Set(logs.map((l) => l.at.slice(0, 10)));
  return days.size >= COLD_AFTER_DISTINCT_DAYS;
}
