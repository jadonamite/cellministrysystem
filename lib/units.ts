import type { ApiGroup, GroupNode, Level, Unit } from "./types";
import { byId } from "./levels";

/**
 * Tree operations over the generic Unit model.
 *
 * Nothing here knows what a "cell" or a "team" is — only ranks and parent
 * pointers. That is deliberate: every hierarchy view in the app (cell leader,
 * senior cell, team, PCF, chapter, group, zone, admin) is the same query run
 * from a different node, so there is one implementation to get right.
 */

/** Resolve a stored unit against the level table into what the app renders. */
export function toApiGroup(unit: Unit, levels: Map<string, Level>): ApiGroup {
  const level = levels.get(unit.levelId);
  return {
    _id: unit._id,
    name: unit.name,
    level: level?.name ?? "Unit",
    levelRank: level?.rank ?? 999,
    parentId: unit.parentId,
    createdAt: unit.createdAt,
    promotedAt: unit.promotedAt,
  };
}

export function resolveUnits(units: Unit[], levels: Level[]): ApiGroup[] {
  const map = byId(levels);
  return units.map((u) => toApiGroup(u, map));
}

/** Nest a flat list into a forest, children sorted by name at every depth. */
export function buildTree(groups: ApiGroup[]): GroupNode[] {
  const nodes = new Map<string, GroupNode>(
    groups.map((g) => [g._id, { ...g, children: [] }])
  );
  const roots: GroupNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const byName = (a: GroupNode, b: GroupNode) => a.name.localeCompare(b.name);
  for (const node of nodes.values()) node.children.sort(byName);
  roots.sort(byName);
  return roots;
}

/** Units with no children — where people are actually attributed. */
export function leafNodes(roots: GroupNode[]): GroupNode[] {
  const leaves: GroupNode[] = [];
  const walk = (n: GroupNode) => {
    if (n.children.length === 0) leaves.push(n);
    else n.children.forEach(walk);
  };
  roots.forEach(walk);
  return leaves;
}

/** Every unit id → its ancestor chain, self first, root last. */
export function ancestryMap(groups: ApiGroup[]): Map<string, ApiGroup[]> {
  const index = new Map(groups.map((g) => [g._id, g]));
  const map = new Map<string, ApiGroup[]>();
  for (const g of groups) {
    const chain: ApiGroup[] = [];
    const seen = new Set<string>();
    let cur: ApiGroup | undefined = g;
    // guard against a parent cycle introduced by a bad re-parent
    while (cur && !seen.has(cur._id)) {
      seen.add(cur._id);
      chain.push(cur);
      cur = cur.parentId ? index.get(cur.parentId) : undefined;
    }
    map.set(g._id, chain);
  }
  return map;
}

/**
 * Every unit at or beneath `unitId` — the one primitive behind every scoped
 * view in the app. A cell leader's subtree is their cell; a zone pastor's is
 * the whole tenant. Same call, different node.
 */
export function subtree(groups: ApiGroup[], unitId: string): ApiGroup[] {
  const childrenOf = new Map<string, ApiGroup[]>();
  for (const g of groups) {
    if (!g.parentId) continue;
    const arr = childrenOf.get(g.parentId) ?? [];
    arr.push(g);
    childrenOf.set(g.parentId, arr);
  }
  const start = groups.find((g) => g._id === unitId);
  if (!start) return [];

  const out: ApiGroup[] = [];
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length) {
    const node = stack.pop()!;
    if (seen.has(node._id)) continue;
    seen.add(node._id);
    out.push(node);
    stack.push(...(childrenOf.get(node._id) ?? []));
  }
  return out;
}

/**
 * Authorisation, in one predicate: can a session bound to `fromUnitId` reach
 * `targetUnitId` by descending the tree? Every read and write checks this.
 */
export function canReach(
  groups: ApiGroup[],
  fromUnitId: string,
  targetUnitId: string
): boolean {
  if (fromUnitId === targetUnitId) return true;
  const chain = ancestryMap(groups).get(targetUnitId) ?? [];
  return chain.some((g) => g._id === fromUnitId);
}

/**
 * Whether `parentId` is a legal parent for a unit at `levelRank`: strictly
 * higher in the tree, and not inside the unit's own subtree (which would
 * create a cycle).
 */
export function canParent(
  groups: ApiGroup[],
  unitId: string | null,
  parentId: string,
  levelRank: number
): boolean {
  const parent = groups.find((g) => g._id === parentId);
  if (!parent) return false;
  if (parent.levelRank >= levelRank) return false;
  if (unitId && canReach(groups, unitId, parentId)) return false;
  return true;
}

/** Depth of each unit within the rendered forest — used for indentation. */
export function depthMap(roots: GroupNode[]): Map<string, number> {
  const map = new Map<string, number>();
  const walk = (n: GroupNode, d: number) => {
    map.set(n._id, d);
    n.children.forEach((c) => walk(c, d + 1));
  };
  roots.forEach((r) => walk(r, 0));
  return map;
}
