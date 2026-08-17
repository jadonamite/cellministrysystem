import { ancestryMap, buildTree, getGroups } from "./groups";
import { unitColorMap } from "./team-colors";
import { groupRollup } from "./data";
import { loadContacts, activePlanWindow } from "./live-data";

/** Shared server-side assembly used by every page. */
export async function loadAppData() {
  const groups = await getGroups();
  const roots = buildTree(groups);
  const plan = await activePlanWindow();
  const contacts = await loadContacts();
  const rollup = groupRollup(groups, roots, contacts);
  const teamColorOf = unitColorMap(groups);

  const ancestry = ancestryMap(groups);
  const originOf: Record<string, string> = {};
  const colorOf: Record<string, string> = {};
  const teamOf: Record<string, string> = {};
  // unit id → its immediate parent id, used for leader scoping; "" at a root.
  // Level-agnostic on purpose: a leader is bound to a unit at any depth, so
  // this can no longer look for a level literally named "Senior Cell".
  const seniorOf: Record<string, string> = {};
  for (const [id, chain] of ancestry) {
    const team = chain[chain.length - 1];
    originOf[id] =
      chain.length > 1 ? `${chain[0].name} · ${team.name}` : chain[0].name;
    colorOf[id] = teamColorOf[team._id];
    teamOf[id] = team._id;
    seniorOf[id] = chain[1]?._id ?? "";
  }

  return { groups, roots, contacts, rollup, teamColorOf, originOf, colorOf, teamOf, seniorOf, plan };
}
