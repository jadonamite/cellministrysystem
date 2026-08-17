"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { outreachWired, isObjectId, outreachFetch } from "@/lib/outreach-api";
import { resolveActiveEventId } from "@/lib/live-data";

export interface SaveContactsInput {
  groupId: string;
  broughtBy: string;
  contacts: { name: string; phone: string; location?: string }[];
}

export interface SaveContactsResult {
  ok: boolean;
  saved: number;
  skipped: number;
  error?: string;
}

/** Server-side gate: same shape the parser enforces client-side, re-checked here. */
function normalize(name: string, phone: string): { name: string; phone: string } | null {
  const cleanName = name.trim();
  const cleanPhone = phone.replace(/\s/g, "").replace(/^\+234/, "0");
  if (cleanName.length < 2) return null;
  if (!/^0\d{10}$/.test(cleanPhone)) return null;
  return { name: cleanName, phone: cleanPhone };
}

/**
 * Bulk-insert a cell's collated list against the active event.
 *
 * When the outreach API is wired (env set) and the active event is a real
 * ObjectId, this POSTs to `/api/outreach/contacts` and trusts the server's
 * saved/skipped counts (it phone-dedupes per event too). Otherwise it stays on
 * the demo stub: validate → dedupe → count, persisting nothing.
 */
export async function saveContacts(input: SaveContactsInput): Promise<SaveContactsResult> {
  const { groupId, broughtBy } = input;
  if (!groupId || broughtBy.trim().length < 2) {
    return { ok: false, saved: 0, skipped: 0, error: "Pick a cell and enter the rep's name." };
  }

  // validate + dedupe by phone within this batch
  const seen = new Set<string>();
  const clean: { name: string; phone: string; location?: string }[] = [];
  let skipped = 0;
  for (const row of input.contacts) {
    const n = normalize(row.name, row.phone);
    if (!n || seen.has(n.phone)) {
      skipped += 1;
      continue;
    }
    seen.add(n.phone);
    const location = row.location?.trim().slice(0, 80) || undefined;
    clean.push({ ...n, location });
  }
  if (clean.length === 0) {
    return { ok: false, saved: 0, skipped, error: "No valid rows to save." };
  }

  // Resolve the active event to its persisted id so saves land on the real event.
  const eventId = outreachWired() ? await resolveActiveEventId() : null;

  // Live persistence — only when wired and the event exists; else the demo stub.
  if (eventId && isObjectId(eventId)) {
    try {
      const data = await outreachFetch("/api/outreach/contacts", {
        method: "POST",
        body: { eventId, groupId, broughtBy: broughtBy.trim(), contacts: clean },
      });
      revalidateTag("outreach", "max");
      revalidatePath("/contacts");
      revalidatePath("/");
      // The API re-dedupes against contacts already on the event; add its skips.
      return {
        ok: true,
        saved: Number(data.saved ?? 0),
        skipped: skipped + Number(data.skipped ?? 0),
      };
    } catch (e) {
      return { ok: false, saved: 0, skipped, error: (e as Error).message };
    }
  }

  // Demo stub: persist nothing, report the batch-local counts.
  revalidatePath("/contacts");
  revalidatePath("/");
  return { ok: true, saved: clean.length, skipped };
}
