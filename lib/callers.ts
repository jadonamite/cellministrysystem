import { outreachWired } from "./outreach-api";

/**
 * Callers — the volunteers who work the phones. Admin-created (name + 4-digit
 * PIN); a caller enters their PIN once per device and every call log auto-carries
 * their id.
 *
 * The roster is served live from `GET /api/outreach/callers` when the outreach
 * API is wired; the array below is the seed / local-dev fallback (PINs here are
 * placeholders — real ones are scrypt-hashed server-side).
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

// Stub assignments use real Group ids from the live tree (see lib/groups.ts).
export const CALLERS: CallerRecord[] = [
  { id: "c-kanyin", name: "Sis. Kanyin", pin: "4304", active: true, seniorCellId: "6a4757c45d8d393b7cba351d", seniorCellName: "Agape" },
  { id: "c-amos", name: "Bro. Amos", pin: "9528", active: true, seniorCellId: "6a46840c32abf8f0df5c812b", seniorCellName: "Harvesters" },
  { id: "c-nifemi", name: "Sis. Nifemi", pin: "3483", active: true, seniorCellId: "6a46842632abf8f0df5c8134", seniorCellName: "Pacesetters" },
  { id: "c-emma", name: "Bro. Emma", pin: "5629", active: true }, // unassigned — all-access
];

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
