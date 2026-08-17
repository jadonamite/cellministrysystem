export type GroupLevel = "TEAM" | "SENIOR_CELL" | "CELL";

export interface ApiGroup {
  _id: string;
  name: string;
  level: GroupLevel;
  parentId: string | null;
  createdAt: string;
}

export interface GroupNode extends ApiGroup {
  children: GroupNode[];
}

export type ContactOutcome =
  | "answered"
  | "no_answer"
  | "messaged_only"
  | "not_contacted";

export type Channel = "call" | "message";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  /** leaf group (cell) that brought this contact */
  groupId: string;
  broughtBy: string;
  /** where the contact is coming from — area/address; null = not captured */
  location: string | null;
  /** day index within the 7-week plan when contact was attempted; null = not yet */
  contactedDay: number | null;
  channel: Channel | null;
  outcome: ContactOutcome;
  attempts: number;
  followUpDay: number | null;
}
