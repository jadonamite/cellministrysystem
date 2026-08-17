import type { Level } from "./types";

/**
 * The default chain seeded for a new tenant.
 *
 * These are *seed data*, not a schema. A zone that calls the fourth rung
 * something other than PCF, or has no Team tier at all, edits its own rows —
 * no code changes. Ranks are spaced so a level can be inserted between two
 * existing ones later without renumbering the whole chain.
 */
export const DEFAULT_LEVELS: Omit<Level, "id">[] = [
  { name: "Zone", rank: 0, optional: false },
  { name: "Group", rank: 10, optional: false },
  { name: "Chapter", rank: 20, optional: false },
  { name: "PCF", rank: 30, optional: false },
  { name: "Team", rank: 40, optional: true },
  { name: "Senior Cell", rank: 50, optional: true },
  { name: "Cell", rank: 60, optional: false },
];

/** Levels sorted top-down. */
export function ordered(levels: Level[]): Level[] {
  return [...levels].sort((a, b) => a.rank - b.rank);
}

export function byId(levels: Level[]): Map<string, Level> {
  return new Map(levels.map((l) => [l.id, l]));
}

/** The bottom rung — where people are attributed. */
export function leafLevel(levels: Level[]): Level | undefined {
  return ordered(levels).at(-1);
}

/**
 * Valid parents for a unit at `levelId`: any level of strictly higher rank.
 * Not "the level directly above" — that assumption is what made the old
 * three-level model unable to skip a Team or hold a cell with no senior cell.
 */
export function allowedParentLevels(levels: Level[], levelId: string): Level[] {
  const target = levels.find((l) => l.id === levelId);
  if (!target) return [];
  return ordered(levels).filter((l) => l.rank < target.rank);
}

/**
 * The next rung up from a unit's current level — the default target when
 * promoting a cell to a senior cell. Skips nothing: the caller may promote to
 * any higher level, this is only the suggestion.
 */
export function nextLevelUp(levels: Level[], levelId: string): Level | undefined {
  const target = levels.find((l) => l.id === levelId);
  if (!target) return undefined;
  return ordered(levels)
    .filter((l) => l.rank < target.rank)
    .at(-1);
}

/**
 * Which credential a leader bound to this level must use. A cell leader is on
 * a phone and sees one cell — a PIN is the right friction. Anything above can
 * see a whole branch, so the credential has to be worth what it unlocks. This
 * is derived from rank rather than configured per person, so promoting a cell
 * automatically upgrades what its leader must sign in with.
 */
export function credentialFor(levels: Level[], levelId: string): "pin" | "password" {
  const leaf = leafLevel(levels);
  return leaf && leaf.id === levelId ? "pin" : "password";
}
