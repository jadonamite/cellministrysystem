"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CALLERS } from "@/lib/callers";
import { outreachWired, isObjectId, outreachFetch } from "@/lib/outreach-api";

const YEAR = 60 * 60 * 24 * 365;

export interface SetCallerResult {
  ok: boolean;
  name?: string;
  error?: string;
}

/**
 * Verify a caller's name + 4-digit PIN and remember them on this device.
 *
 * When wired and the caller id is a real ObjectId, the PIN is checked server-side
 * (scrypt) via `/api/outreach/callers/verify`. Demo roster ids fall back to the
 * local check. The cookie contract is identical either way.
 */
export async function setCaller(callerId: string, pin: string): Promise<SetCallerResult> {
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: "Enter your 4-digit PIN." };

  let id = callerId;
  let name: string;
  let seniorCellId: string | null = null;
  let seniorCellName: string | null = null;

  if (outreachWired() && isObjectId(callerId)) {
    try {
      const data = await outreachFetch("/api/outreach/callers/verify", {
        method: "POST",
        body: { callerId, pin },
      });
      id = String(data.id);
      name = String(data.name);
      seniorCellId = data.seniorCellId ? String(data.seniorCellId) : null;
      seniorCellName = data.seniorCellName ? String(data.seniorCellName) : null;
    } catch {
      // Generic message — don't leak whether the caller exists or the PIN is wrong.
      return { ok: false, error: "Wrong PIN." };
    }
  } else {
    const caller = CALLERS.find((c) => c.id === callerId && c.active);
    if (!caller) return { ok: false, error: "Pick your name." };
    if (caller.pin !== pin) return { ok: false, error: "Wrong PIN." };
    name = caller.name;
    seniorCellId = caller.seniorCellId ?? null;
    seniorCellName = caller.seniorCellName ?? null;
  }

  const store = await cookies();
  const opts = { path: "/", maxAge: YEAR, sameSite: "lax" as const };
  store.set("caller_id", id, opts);
  store.set("caller_name", name, opts);
  // Senior-cell scope: set when assigned, cleared otherwise so a re-signin as an
  // all-access caller doesn't inherit a stale scope.
  if (seniorCellId) {
    store.set("caller_senior_id", seniorCellId, opts);
    store.set("caller_senior_name", seniorCellName ?? "", opts);
  } else {
    store.delete("caller_senior_id");
    store.delete("caller_senior_name");
  }
  revalidatePath("/", "layout");
  return { ok: true, name };
}

/** Forget the caller on this device (e.g. a shared phone changing hands). */
export async function clearCaller() {
  const store = await cookies();
  store.delete("caller_id");
  store.delete("caller_name");
  store.delete("caller_senior_id");
  store.delete("caller_senior_name");
  revalidatePath("/", "layout");
}

export interface CreateCallerResult {
  ok: boolean;
  error?: string;
}

/**
 * Admin: register a new caller (name + 4-digit PIN).
 *
 * When wired, POSTs to `/api/outreach/callers` (PIN hashed server-side via
 * scrypt) and the caller persists. With no env it stays on the stub: validates
 * against the static roster and reports success without persisting.
 */
export async function createCaller(
  name: string,
  pin: string,
  seniorCell?: { id: string; name: string } | null
): Promise<CreateCallerResult> {
  if (name.trim().length < 2) return { ok: false, error: "Enter the caller's name." };
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: "PIN must be exactly 4 digits." };

  if (outreachWired()) {
    try {
      await outreachFetch("/api/outreach/callers", {
        method: "POST",
        body: {
          name: name.trim(),
          pin,
          seniorCellId: seniorCell?.id,
          seniorCellName: seniorCell?.name,
        },
      });
      revalidatePath("/settings");
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  // Demo stub: guard against duplicates in the static roster, persist nothing.
  if (CALLERS.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
    return { ok: false, error: "A caller with that name already exists." };
  }
  revalidatePath("/settings");
  return { ok: true };
}

/**
 * Admin: (re)assign a caller's senior cell — pass `null` to clear it back to
 * all-access. Persists via the API when wired (real ObjectId); a no-op against
 * the static stub otherwise.
 */
export async function assignCaller(
  id: string,
  seniorCell: { id: string; name: string } | null
): Promise<CreateCallerResult> {
  if (outreachWired() && isObjectId(id)) {
    try {
      await outreachFetch("/api/outreach/callers", {
        method: "PATCH",
        body: {
          id,
          seniorCellId: seniorCell?.id ?? null,
          seniorCellName: seniorCell?.name ?? null,
        },
      });
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }
  revalidatePath("/settings");
  return { ok: true };
}

/**
 * Admin: remove a caller. Persists via the API when wired (real ObjectId);
 * a no-op against the static stub otherwise.
 */
export async function deleteCaller(id: string): Promise<CreateCallerResult> {
  if (outreachWired() && isObjectId(id)) {
    try {
      await outreachFetch("/api/outreach/callers", { method: "DELETE", body: { id } });
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }
  revalidatePath("/settings");
  return { ok: true };
}
