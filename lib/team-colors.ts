import { ApiGroup } from "./types";
import { ancestryMap } from "./groups";

/**
 * Colour coding for the hierarchy.
 *
 * Top-level units take one of five hues, assigned deterministically by sorted
 * name so a team keeps its colour across reloads and a new one picks up the
 * next free slot. Everything below inherits its top-level unit's hue —
 * so colour encodes *which branch of the tree* a row belongs to, and a cell
 * always reads as part of its team. Depth is expressed by washing the hue
 * toward the surface rather than by picking an unrelated colour.
 *
 * Values resolve per theme via globals.css.
 */
const SLOTS = 5;

/** Roots (teams) → their hue variable. */
export function teamColorMap(groups: ApiGroup[]): Record<string, string> {
  const roots = groups
    .filter((g) => !g.parentId)
    .sort((a, b) => a.name.localeCompare(b.name));
  const map: Record<string, string> = {};
  roots.forEach((t, i) => {
    map[t._id] = `var(--team-${(i % SLOTS) + 1})`;
  });
  return map;
}

/**
 * Every unit → the hue of its top-level ancestor. A cell, senior cell and
 * their team all resolve to the same hue, so a table scanned vertically shows
 * branches rather than noise.
 */
export function unitColorMap(groups: ApiGroup[]): Record<string, string> {
  const roots = teamColorMap(groups);
  const ancestry = ancestryMap(groups);
  const map: Record<string, string> = {};
  for (const g of groups) {
    const chain = ancestry.get(g._id) ?? [];
    const root = chain[chain.length - 1];
    if (root && roots[root._id]) map[g._id] = roots[root._id];
  }
  return map;
}

/**
 * The hue washed toward the page surface — for chips and fills where the full
 * hue would shout. Depth 0 (a team) stays strong; deeper units soften.
 */
export function unitTint(color: string, depth: number): string {
  const wash = Math.min(depth, 3) * 8;
  return `color-mix(in srgb, ${color} ${28 - wash}%, var(--card))`;
}
