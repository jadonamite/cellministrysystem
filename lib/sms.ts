/**
 * Provider-agnostic bulk SMS layer. We keep TWO providers wired and pick one at
 * send-time (Jadon: "depending on what time we want") — Termii for reach/DND,
 * BulkSMS Nigeria for cost. Personalization is a server-side loop of
 * single-sends (each provider's single-send takes one message), which also lets
 * us skip invalid/duplicate numbers and get per-recipient delivery status.
 */

export type SmsProviderId = "termii" | "bulksms_nigeria";

/** Generic = promotional (blocked for DND numbers); DND/corporate = reaches DND, needs a registered Sender ID. */
export type SmsRoute = "generic" | "dnd";

export interface SmsProviderMeta {
  id: SmsProviderId;
  label: string;
  /** indicative cost per SMS page in Naira */
  perSms: number;
  note: string;
}

export const SMS_PROVIDERS: SmsProviderMeta[] = [
  {
    id: "termii",
    label: "Termii",
    perSms: 16,
    note: "Best reach + DND route; also powers our WhatsApp. Sender ID needs whitelisting for DND.",
  },
  {
    id: "bulksms_nigeria",
    label: "BulkSMS Nigeria",
    perSms: 5.62,
    note: "Cheapest per SMS. Same DND/Sender-ID rules apply.",
  },
];

export function providerMeta(id: SmsProviderId): SmsProviderMeta {
  return SMS_PROVIDERS.find((p) => p.id === id) ?? SMS_PROVIDERS[0];
}

/** GSM-7 is 160 chars/page; anything longer bills as multiple pages. */
export function smsPages(text: string): number {
  return Math.max(1, Math.ceil(text.length / 160));
}

/** Personalize a template. Supported tokens: {name}, {event}, {cell}. */
export function fillTemplate(
  template: string,
  vars: { name: string; event: string; cell: string }
): string {
  const first = vars.name.trim().split(/\s+/)[0] || vars.name.trim();
  return template
    .replaceAll("{name}", first)
    .replaceAll("{event}", vars.event)
    .replaceAll("{cell}", vars.cell);
}

/** A valid Nigerian mobile number for sending: 11 digits starting 0. */
export function isSendable(phone: string): boolean {
  return /^0\d{10}$/.test(phone.replace(/\s/g, ""));
}
