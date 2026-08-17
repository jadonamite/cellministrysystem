import { outreachWired } from "./outreach-api";

/**
 * Callers — the volunteers who work the phones. Admin-created (name + 4-digit
 * PIN); a caller enters their PIN once per device and every call log auto-carries
 * their id.
 *
 * The roster is served live from `GET /api/outreach/callers` when the outreach
 * API is wired. This system ships with an empty local roster — every caller is
 * created through the admin UI, so nothing is pre-seeded here.
 */

export interface CallerRecord {
  id: string;
  name: string;
  /** STUB ONLY — real PINs are hashed server-side in e-register. */
  pin: string;
  active: boolean;
  /** optional senior-cell scope — the caller only sees this senior cell's contacts */
  seniorCellId?: string | null;
  seniorCellName?: string | null;
}

/** Roster entry for the sign-in / manager pickers — never carries the PIN. */
export interface RosterCaller {
  id: string;
  name: string;
  seniorCellId?: string | null;
  seniorCellName?: string | null;
}

/** Local fallback roster — intentionally empty; callers live in e-register. */
export const CALLERS: CallerRecord[] = [];

export function findCaller(id: string | undefined): CallerRecord | undefined {
  return id ? CALLERS.find((c) => c.id === id) : undefined;
}

/**
 * Roster for the sign-in / manager pickers — id + name + senior-cell scope,
 * never the PIN. Live from the API when wired, else the local stub.
 * Server-only (reads secrets).
 */
export async function callerRoster(): Promise<RosterCaller[]> {
  if (outreachWired()) {
    try {
      const res = await fetch(`${process.env.OUTREACH_API}/api/outreach/callers`, {
        headers: { authorization: `Bearer ${process.env.OUTREACH_API_KEY}` },
        cache: "no-store",
      });
      if (res.ok) return (await res.json()) as RosterCaller[];
    } catch {
      // fall through to the stub below
    }
  }
  return CALLERS.filter((c) => c.active).map(({ id, name, seniorCellId, seniorCellName }) => ({
    id,
    name,
    seniorCellId: seniorCellId ?? null,
    seniorCellName: seniorCellName ?? null,
  }));
}
