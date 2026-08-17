"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import type { CallOutcome, Channel, Disposition } from "@/lib/outreach";
import { CALL_OUTCOMES } from "@/lib/outreach";
import { outreachWired, isObjectId, outreachFetch } from "@/lib/outreach-api";
import { getSession } from "@/lib/auth";

export interface LogOutcomeInput {
  contactId: string;
  outcome: CallOutcome;
  disposition?: Disposition;
  callBackAt?: string; // ISO date, only for call_back_later
  note?: string;
}

export interface LogOutcomeResult {
  ok: boolean;
  error?: string;
}

/**
 * Record a single call/message attempt against a contact.
 *
 * When wired (env set) and the contact is a real ObjectId, this POSTs to
 * `/api/outreach/logs` (the server derives status + next follow-up from the
 * accumulated logs). Demo contact ids fall back to the stub. The caller id is
 * carried automatically from the per-device cookie set at PIN entry.
 */
export async function logOutcome(input: LogOutcomeInput): Promise<LogOutcomeResult> {
  const meta = CALL_OUTCOMES[input.outcome];
  if (!meta) return { ok: false, error: "Unknown outcome." };

  // a disposition only makes sense when the person was actually reached
  if (input.disposition && !meta.reached) {
    return { ok: false, error: "Disposition only applies when the contact was reached." };
  }
  if (input.disposition === "call_back_later" && !input.callBackAt) {
    return { ok: false, error: "Pick the call-back date." };
  }

  const store = await cookies();
  const callerId = store.get("caller_id")?.value ?? "unassigned";
  const channel: Channel = meta.channel;

  // Live persistence — only for a real contact id; demo ids stay on the stub.
  if (outreachWired() && isObjectId(input.contactId)) {
    try {
      await outreachFetch("/api/outreach/logs", {
        method: "POST",
        body: { ...input, callerId, channel, at: new Date().toISOString() },
      });
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  // Invalidate the cached contact/log reads once, then refresh the rendered
  // routes so the new attempt shows without a full app-wide refetch.
  revalidateTag("outreach", "max");
  revalidatePath("/contacts");
  revalidatePath("/follow-ups");
  revalidatePath("/");
  return { ok: true };
}

export interface DeleteContactResult {
  ok: boolean;
  error?: string;
}

/**
 * Admin: remove a contact (fake/invalid details) and its call history.
 * Admin-only, and gated on a real ObjectId so the demo/stub data can't be
 * deleted (string ids fall through as a harmless no-op).
 */
export async function deleteContact(id: string): Promise<DeleteContactResult> {
  const session = await getSession();
  if (session?.role !== "admin") return { ok: false, error: "Admins only." };

  if (outreachWired() && isObjectId(id)) {
    try {
      await outreachFetch("/api/outreach/contacts", { method: "DELETE", body: { id } });
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }
  revalidateTag("outreach", "max");
  revalidatePath("/contacts");
  revalidatePath("/follow-ups");
  revalidatePath("/");
  return { ok: true };
}
