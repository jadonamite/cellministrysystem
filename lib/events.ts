export type EventStatus = "live" | "upcoming" | "ended";

export interface OutreachEvent {
  id: string;
  name: string;
  /** call center admin responsible for this event */
  admin: string;
  /** people to reach before event day */
  target: number;
  /** event-day start/stop */
  eventStart: string; // ISO
  eventEnd: string;
  /** outreach campaign window feeding the event */
  campaignStart: string; // ISO date
  campaignDays: number;
  status: EventStatus;
}

/**
 * Until the outreach API lands, events are defined here. The live event is
 * the one the dashboard's dummy data models.
 */
export const EVENTS: OutreachEvent[] = [
  {
    id: "love-expression",
    name: "Love Expression",
    admin: "Admin",
    target: 5000,
    eventStart: "2026-07-12T09:00:00+01:00",
    eventEnd: "2026-07-12T13:00:00+01:00",
    campaignStart: "2026-07-01",
    campaignDays: 11,
    status: "live",
  },
  {
    id: "convocation-august",
    name: "Convocation Outreach",
    admin: "Admin",
    target: 800,
    eventStart: "2026-08-16T08:00:00+01:00",
    eventEnd: "2026-08-16T14:00:00+01:00",
    campaignStart: "2026-08-03",
    campaignDays: 14,
    status: "upcoming",
  },
];

export const LIVE_EVENT_ID = "love-expression";

export function getEvent(id: string | undefined): OutreachEvent {
  return EVENTS.find((e) => e.id === id) ?? EVENTS[0];
}

export function fmtEventDay(e: OutreachEvent): string {
  const start = new Date(e.eventStart);
  const end = new Date(e.eventEnd);
  const day = start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Africa/Lagos",
  });
  const t = (d: Date) =>
    d.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Africa/Lagos",
    });
  return `${day} · ${t(start)} – ${t(end)}`;
}
