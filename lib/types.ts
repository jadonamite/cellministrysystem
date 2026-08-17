/**
 * The hierarchy is arbitrary-depth and data-driven.
 *
 * There is no fixed level enum. A deployment defines its own chain of levels
 * (Zone → Group → Chapter → PCF → Team → Senior Cell → Cell, or whatever that
 * zone actually uses) as rows in the levels table, and every unit is the same
 * shape regardless of where it sits. That is what lets the system run in
 * another zone without a rewrite, skip optional levels, be built from the
 * ground up, and promote a cell into a senior cell.
 */

/** A rung on the hierarchy. Seeded per tenant, editable, never hardcoded. */
export interface Level {
  id: string;
  name: string;
  /** 0 is the top (Zone). Larger is further down. */
  rank: number;
  /** may be skipped entirely — e.g. Team */
  optional: boolean;
}

/** A zone deploying the system. Every record below is scoped to one. */
export interface Tenant {
  id: string;
  name: string;
  rootUnitId: string;
  createdAt: string;
}

/**
 * One node of the tree — a Zone and a Cell are the same shape and differ only
 * by their level's rank. A unit's parent may be any unit of strictly higher
 * rank, not necessarily rank − 1; that single rule is what makes optional
 * levels work with no special-casing.
 */
export interface Unit {
  _id: string;
  tenantId: string;
  name: string;
  levelId: string;
  parentId: string | null;
  createdAt: string;
  /** stamped when this unit was promoted to its current level */
  promotedAt: string | null;
  /** hidden from pickers; its history stays valid */
  archivedAt: string | null;
}

/** A unit with its level resolved — what the app actually renders. */
export interface ApiGroup {
  _id: string;
  name: string;
  /** the level's display name, e.g. "Senior Cell" */
  level: string;
  /** the level's rank; 0 is the top of the tree */
  levelRank: number;
  parentId: string | null;
  createdAt: string;
  promotedAt?: string | null;
}

export interface GroupNode extends ApiGroup {
  children: GroupNode[];
}

/** A promotion of a unit up the chain, kept for the multiplication timeline. */
export interface UnitPromotion {
  id: string;
  tenantId: string;
  unitId: string;
  fromLevelId: string;
  toLevelId: string;
  at: string;
  confirmedBy: string;
}

/* ---------- people ---------- */

/**
 * The three populations a cell reports, counted separately and never merged.
 * An invitee becomes a new member by attending; a new member becomes a member
 * after more than three services.
 */
export type PersonClass = "invitee" | "new_member" | "member";

/** Executive roles, held by members. BST is earned, not assigned. */
export type ExecRole = "CL" | "ACL" | "BST" | "CS" | "CFC";

export interface Person {
  _id: string;
  tenantId: string;
  name: string;
  /** required, normalised — the join key into e-register's attendance */
  phone: string;
  /** the cell they belong to */
  unitId: string;
  personClass: PersonClass;
  roles: ExecRole[];
  /** the member who brought them — drives BST eligibility */
  broughtById: string | null;
  joinedAt: string;
  classChangedAt: string;
  archivedAt: string | null;
}

/* ---------- promotion engine ---------- */

export interface Promotion {
  id: string;
  tenantId: string;
  subjectType: "person" | "unit";
  subjectId: string;
  from: string;
  to: string;
  detectedAt: string;
  confirmedAt: string | null;
  confirmedBy: string | null;
  dismissedAt: string | null;
  /** why this was detected — shown in the UI, never a shrug */
  evidence: Record<string, unknown>;
}

/* ---------- outreach leftovers ----------
 * Inherited from the call centre this repo was forked from. The screens that
 * use them are removed in the cleanup phase; kept until then so the app keeps
 * building. Nothing new should reference these.
 */

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
  groupId: string;
  broughtBy: string;
  location: string | null;
  contactedDay: number | null;
  channel: Channel | null;
  outcome: ContactOutcome;
  attempts: number;
  followUpDay: number | null;
}
