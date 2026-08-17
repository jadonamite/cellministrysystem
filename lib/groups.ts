import type { ApiGroup, Level, Unit } from "./types";
import { COLLECTIONS, dbWired, scoped } from "./db";
import { resolveUnits } from "./units";
import { currentTenantId } from "./tenant";

/**
 * The hierarchy is owned here.
 *
 * It used to be read from e-register's /api/groups, which models a fixed
 * TEAM → SENIOR_CELL → CELL chain. This system needs arbitrary depth, optional
 * levels and promotion, so the tree lives in our own database and e-register
 * reads from here rather than keeping a second, drifting copy. See SPEC §8.
 *
 * Until the database is configured the tree is empty — there is no seeded
 * fallback, so an unwired app shows a true blank slate rather than a stale
 * snapshot of somebody else's structure.
 */

export async function getLevels(tenantId: string): Promise<Level[]> {
  if (!dbWired()) return [];
  try {
    const levels = await scoped<Level & { tenantId: string }>(
      COLLECTIONS.levels,
      tenantId
    );
    return await levels.find();
  } catch {
    return [];
  }
}

export async function getUnits(tenantId: string): Promise<Unit[]> {
  if (!dbWired()) return [];
  try {
    const units = await scoped<Unit>(COLLECTIONS.units, tenantId);
    return await units.find({ archivedAt: null } as never);
  } catch {
    return [];
  }
}

/**
 * The tenant's tree, with each unit's level resolved for rendering. The tenant
 * is resolved from the request when not passed, so pages can stay unaware of
 * it while every query underneath stays scoped.
 */
export async function getGroups(tenantId?: string): Promise<ApiGroup[]> {
  if (!dbWired()) return [];
  const tenant = tenantId ?? (await currentTenantId());
  if (!tenant) return [];
  const [units, levels] = await Promise.all([
    getUnits(tenant),
    getLevels(tenant),
  ]);
  return resolveUnits(units, levels);
}

// Tree helpers live in ./units — re-exported so existing imports keep working.
export { buildTree, leafNodes, ancestryMap, subtree, canReach } from "./units";
