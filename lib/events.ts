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
 * Events are defined here until they move behind the API. This system ships
 * with none — the list is empty and every event is created by an admin.
 */
export const EVENTS: OutreachEvent[] = [];

/**
 * Stand-in for "no event selected", so the plan-window maths and the shell keep
 * rendering against an empty list instead of crashing on `EVENTS[0]`. Its window
 * is a single zero-target day, which reads as a blank dashboard.
 */
export const NO_EVENT: OutreachEvent = {
  id: "none",
  name: "No active event",
  admin: "—",
  target: 0,
  eventStart: "1970-01-01T00:00:00Z",
  eventEnd: "1970-01-01T00:00:00Z",
  campaignStart: "1970-01-01",
  campaignDays: 1,
  status: "upcoming",
};

/** Id of the currently live event, or the placeholder when there is none. */
export const LIVE_EVENT_ID =
  EVENTS.find((e) => e.status === "live")?.id ?? NO_EVENT.id;

export function getEvent(id: string | undefined): OutreachEvent {
  return EVENTS.find((e) => e.id === id) ?? EVENTS[0] ?? NO_EVENT;
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
