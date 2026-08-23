import { getSession, type SessionPayload } from "./auth";
import { getGroups } from "./groups";
import { canReach, subtree } from "./units";
import type { ApiGroup } from "./types";

/**
 * What the signed-in session is allowed to see.
 *
 * This is the only place the question is answered, and every page reads
 * through it. An admin sees the whole tenant; a leader sees the subtree under
 * the unit they are bound to — their own cell, their senior cell's cells,
 * their team, their chapter, their zone. One implementation, every level.
 *
 * Server-only.
 */

export interface Scope {
  session: SessionPayload;
  /** every unit this session may see, already filtered */
  groups: ApiGroup[];
  /** the unit the session is anchored to; null for an admin (whole tenant) */
  rootUnitId: string | null;
  isAdmin: boolean;
  /** may this session see that unit at all? */
  allows(unitId: string): boolean;
}

/** Null when signed out — callers redirect to /login. */
export async function getScope(): Promise<Scope | null> {
  const session = await getSession();
  if (!session) return null;

  const all = await getGroups(session.tenantId);
  const isAdmin = session.role === "admin";
  const rootUnitId = isAdmin ? null : (session.role === "leader" ? session.unitId : (session.unitId ?? null));

  const groups = rootUnitId ? subtree(all, rootUnitId) : all;
  const visible = new Set(groups.map((g) => g._id));

  return {
    session,
    groups,
    rootUnitId,
    isAdmin,
    allows(unitId: string) {
      if (isAdmin) return true;
      if (visible.has(unitId)) return true;
      // fall back to a tree walk in case the cached set is stale mid-request
      return rootUnitId ? canReach(all, rootUnitId, unitId) : false;
    },
  };
}

/**
 * Guard for a page or action that operates on one unit. Throws rather than
 * returning a falsy value so a forgotten check can't silently pass — a leader
 * reading a sibling cell is a breach, not a rendering bug.
 */
export async function requireUnit(unitId: string): Promise<Scope> {
  const scope = await getScope();
  if (!scope) throw new Error("Not signed in.");
  if (!scope.allows(unitId)) {
    throw new Error("You don't have access to that unit.");
  }
  return scope;
}

/** Guard for admin-only operations (structure edits, tenant settings). */
export async function requireAdmin(): Promise<Scope> {
  const scope = await getScope();
  if (!scope) throw new Error("Not signed in.");
  if (!scope.isAdmin) throw new Error("That's an admin-only action.");
  return scope;
}
