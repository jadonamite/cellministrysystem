"use server";

import { revalidatePath } from "next/cache";
import {
  fillTemplate,
  isSendable,
  type SmsProviderId,
  type SmsRoute,
} from "@/lib/sms";

export interface BroadcastRecipient {
  id: string;
  name: string;
  phone: string;
  cell: string;
}

export interface SendBroadcastInput {
  provider: SmsProviderId;
  route: SmsRoute;
  template: string;
  eventName: string;
  recipients: BroadcastRecipient[];
}

export interface SendBroadcastResult {
  ok: boolean;
  queued: number;
  skipped: number;
  error?: string;
}

/**
 * Send a personalized SMS to a chosen audience.
 *
 * STUB: no provider account yet. When we open one, replace the marked block
 * with a server-side loop of single-sends against the chosen provider
 * (Termii `POST /api/sms/send` or BulkSMS Nigeria), one personalized message
 * per recipient, collecting per-recipient delivery status. Never send from the
 * client — the API key stays server-side.
 */
export async function sendBroadcast(input: SendBroadcastInput): Promise<SendBroadcastResult> {
  if (input.template.trim().length < 5) {
    return { ok: false, queued: 0, skipped: 0, error: "Write a message first." };
  }

  // only valid, de-duplicated numbers
  const seen = new Set<string>();
  const clean = input.recipients.filter((r) => {
    if (!isSendable(r.phone) || seen.has(r.phone)) return false;
    seen.add(r.phone);
    return true;
  });
  const skipped = input.recipients.length - clean.length;

  if (clean.length === 0) {
    return { ok: false, queued: 0, skipped, error: "No sendable numbers in this audience." };
  }

  // ── send (deferred to provider account) ─────────────────────────────────
  // for (const r of clean) {
  //   const body = fillTemplate(input.template, { name: r.name, event: input.eventName, cell: r.cell });
  //   await sendViaProvider(input.provider, {
  //     to: r.phone, from: SENDER_ID, sms: body, channel: input.route,
  //   });
  // }
  void fillTemplate; // used once the provider loop is live
  // ────────────────────────────────────────────────────────────────────────

  revalidatePath("/messages");
  return { ok: true, queued: clean.length, skipped };
}
