/**
 * Tap-to-call / message deep links. The browser can't detect whether a call
 * connected, so these only *launch* the native dialer / WhatsApp / SMS app —
 * the outcome is then logged manually in the dialog.
 */

/** Default invite copy. Editable in Settings once that lands (cookie-backed). */
export const DEFAULT_INVITE =
  "Hi {name}! You're warmly invited to {event} this Sunday. It's going to be a powerful time — I'd love to see you there. 🙏";

export function fillInvite(template: string, name: string, event: string): string {
  const first = name.trim().split(/\s+/)[0] || name.trim();
  return template.replaceAll("{name}", first).replaceAll("{event}", event);
}

/** 0803… → 234803… for wa.me (which needs the country code, no +). */
function toIntl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
}

export function telLink(phone: string): string {
  return `tel:${phone}`;
}

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${toIntl(phone)}?text=${encodeURIComponent(message)}`;
}

export function smsLink(phone: string, message: string): string {
  return `sms:${phone}?body=${encodeURIComponent(message)}`;
}
