import { ApiGroup } from "./types";

/**
 * Deterministic team → hue assignment. Teams sorted by name take slots in
 * order, so a team keeps its color across reloads and new teams from the API
 * pick up the next free slot. Values resolve per theme via globals.css.
 */
const SLOTS = 5;

export function teamColorMap(groups: ApiGroup[]): Record<string, string> {
  const teams = groups
    .filter((g) => g.level === "TEAM")
    .sort((a, b) => a.name.localeCompare(b.name));
  const map: Record<string, string> = {};
  teams.forEach((t, i) => {
    map[t._id] = `var(--team-${(i % SLOTS) + 1})`;
  });
  return map;
}
