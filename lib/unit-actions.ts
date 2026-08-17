import { randomUUID } from "crypto";
import { COLLECTIONS, dbWired, scoped } from "./db";
import { getGroups, getLevels } from "./groups";
import { canParent, subtree } from "./units";
import type { Level, Unit, UnitPromotion } from "./types";

/**
 * Structural operations on the tree: create, rename, re-parent, promote,
 * archive.
 *
 * Promotion is the one that matters most. The old model was built top-down —
 * a cell could not exist without a senior cell above it, and could never
 * become one. Real cell ministry works the other way: a cell grows, multiplies
 * and is promoted, and the units it spawned are re-parented beneath it. That
 * event is also the clearest growth signal the system has, so it is recorded
 * rather than just applied.
 *
 * Server-only.
 */

export type Result = { ok: true } | { ok: false; error: string };

const NOT_WIRED: Result = {
  ok: false,
  error: "The database isn't connected yet. Add MONGODB_URI and try again.",
};

/**
 * Create a unit anywhere in the tree, ground-up. The only constraint is that
 * the parent sits strictly higher — so a Cell may hang directly off a PCF with
 * no Team or Senior Cell in between, and the first cell in a new zone can be
 * created before anything above it exists.
 */
export async function createUnit(
  tenantId: string,
  input: { name: string; levelId: string; parentId: string | null }
): Promise<Result> {
  if (!dbWired()) return NOT_WIRED;
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Give the unit a name." };

  const [groups, levels] = await Promise.all([
    getGroups(tenantId),
    getLevels(tenantId),
  ]);
  const level = levels.find((l) => l.id === input.levelId);
  if (!level) return { ok: false, error: "Pick a level for this unit." };

  if (input.parentId) {
    if (!canParent(groups, null, input.parentId, level.rank)) {
      return {
        ok: false,
        error: `A ${level.name} can't sit under that unit — its parent must be higher up the tree.`,
      };
    }
  } else if (groups.some((g) => g.parentId === null)) {
    return {
      ok: false,
      error: "There's already a unit at the top of the tree. Choose a parent.",
    };
  }

  const units = await scoped<Unit>(COLLECTIONS.units, tenantId);
  await units.insert({
    _id: randomUUID(),
    name,
    levelId: level.id,
    parentId: input.parentId,
    createdAt: new Date().toISOString(),
    promotedAt: null,
    archivedAt: null,
  } as Omit<Unit, "tenantId">);
  return { ok: true };
}

export async function renameUnit(
  tenantId: string,
  unitId: string,
  name: string
): Promise<Result> {
  if (!dbWired()) return NOT_WIRED;
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Give the unit a name." };
  const units = await scoped<Unit>(COLLECTIONS.units, tenantId);
  await units.update({ _id: unitId } as never, { name: trimmed } as Partial<Unit>);
  return { ok: true };
}

/** Move a unit under a different parent, rejecting cycles and flat moves. */
export async function reparentUnit(
  tenantId: string,
  unitId: string,
  parentId: string
): Promise<Result> {
  if (!dbWired()) return NOT_WIRED;
  const groups = await getGroups(tenantId);
  const unit = groups.find((g) => g._id === unitId);
  if (!unit) return { ok: false, error: "That unit no longer exists." };

  if (!canParent(groups, unitId, parentId, unit.levelRank)) {
    return {
      ok: false,
      error:
        "That move isn't allowed — a unit can't sit under itself or under something at the same level or lower.",
    };
  }

  const units = await scoped<Unit>(COLLECTIONS.units, tenantId);
  await units.update({ _id: unitId } as never, { parentId } as Partial<Unit>);
  return { ok: true };
}

/**
 * Promote a unit and re-parent the units that should now sit beneath it.
 *
 * Raises the unit's level, stamps `promotedAt` — the multiplication timeline
 * reads off this — and writes a history row so the event survives later edits.
 */
export async function promoteUnit(
  tenantId: string,
  input: {
    unitId: string;
    toLevelId: string;
    /** units to move under the promoted unit; may be empty */
    absorb: string[];
    confirmedBy: string;
  }
): Promise<Result> {
  if (!dbWired()) return NOT_WIRED;

  const [groups, levels] = await Promise.all([
    getGroups(tenantId),
    getLevels(tenantId),
  ]);
  const unit = groups.find((g) => g._id === input.unitId);
  if (!unit) return { ok: false, error: "That unit no longer exists." };

  const target = levels.find((l) => l.id === input.toLevelId);
  if (!target) return { ok: false, error: "Pick the level to promote into." };
  if (target.rank >= unit.levelRank) {
    return {
      ok: false,
      error: `${unit.name} is already at ${unit.level} or higher — promotion moves a unit up the tree.`,
    };
  }

  // Absorbed units must be legal children of the unit at its NEW rank, and
  // must not already be inside its subtree.
  const inSubtree = new Set(subtree(groups, input.unitId).map((g) => g._id));
  for (const id of input.absorb) {
    const child = groups.find((g) => g._id === id);
    if (!child) return { ok: false, error: "One of those units no longer exists." };
    if (inSubtree.has(id)) continue;
    if (child.levelRank <= target.rank) {
      return {
        ok: false,
        error: `${child.name} sits at ${child.level} and can't move under a ${target.name}.`,
      };
    }
  }

  const units = await scoped<Unit>(COLLECTIONS.units, tenantId);
  const now = new Date().toISOString();

  await units.update({ _id: input.unitId } as never, {
    levelId: target.id,
    promotedAt: now,
  } as Partial<Unit>);

  for (const id of input.absorb) {
    if (id === input.unitId) continue;
    await units.update({ _id: id } as never, {
      parentId: input.unitId,
    } as Partial<Unit>);
  }

  const history = await scoped<UnitPromotion & { _id: string }>(
    COLLECTIONS.promotions,
    tenantId
  );
  await history.insert({
    _id: randomUUID(),
    id: randomUUID(),
    unitId: input.unitId,
    fromLevelId: levels.find((l) => l.rank === unit.levelRank)?.id ?? "",
    toLevelId: target.id,
    at: now,
    confirmedBy: input.confirmedBy,
  } as never);

  return { ok: true };
}

/**
 * Archive rather than delete — a removed unit would orphan every promotion and
 * person record that ever referenced it. Refuses while children remain, so the
 * tree can never be left dangling.
 */
export async function archiveUnit(
  tenantId: string,
  unitId: string
): Promise<Result> {
  if (!dbWired()) return NOT_WIRED;
  const groups = await getGroups(tenantId);
  const children = groups.filter((g) => g.parentId === unitId);
  if (children.length > 0) {
    return {
      ok: false,
      error: `Move or archive the ${children.length} unit${
        children.length === 1 ? "" : "s"
      } under this one first.`,
    };
  }
  const units = await scoped<Unit>(COLLECTIONS.units, tenantId);
  await units.update({ _id: unitId } as never, {
    archivedAt: new Date().toISOString(),
  } as Partial<Unit>);
  return { ok: true };
}

/** Seed a tenant's level chain. Idempotent — skips if levels already exist. */
export async function seedLevels(
  tenantId: string,
  chain: Omit<Level, "id">[]
): Promise<Result> {
  if (!dbWired()) return NOT_WIRED;
  const levels = await scoped<Level & { tenantId: string }>(
    COLLECTIONS.levels,
    tenantId
  );
  if ((await levels.count()) > 0) return { ok: true };
  await levels.insertMany(
    chain.map((l) => ({ ...l, id: randomUUID() })) as never
  );
  return { ok: true };
}
