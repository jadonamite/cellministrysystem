import { ApiGroup, GroupNode } from "./types";

const GROUPS_ENDPOINT = "https://e-register-nine.vercel.app/api/groups";

/** Snapshot used when the live endpoint is unreachable. */
const FALLBACK_GROUPS: ApiGroup[] = [
  { _id: "6a4754182e2253733bca5102", name: "BELOVED", level: "TEAM", parentId: null, createdAt: "2026-07-03T06:18:00.554Z" },
  { _id: "6a46841932abf8f0df5c812f", name: "PACESETTERS", level: "TEAM", parentId: null, createdAt: "2026-07-02T15:30:33.452Z" },
  { _id: "6a468406ea710cf44881f884", name: "WINNING", level: "TEAM", parentId: null, createdAt: "2026-07-02T15:30:14.261Z" },
  { _id: "6a4754c119bec0813a8abd29", name: "Beloved", level: "SENIOR_CELL", parentId: "6a4754182e2253733bca5102", createdAt: "2026-07-03T06:20:49.992Z" },
  { _id: "6a4754a92e2253733bca5109", name: "Dunamis", level: "SENIOR_CELL", parentId: "6a4754182e2253733bca5102", createdAt: "2026-07-03T06:20:25.276Z" },
  { _id: "6a46842632abf8f0df5c8134", name: "Pacesetters", level: "SENIOR_CELL", parentId: "6a46841932abf8f0df5c812f", createdAt: "2026-07-02T15:30:46.799Z" },
  { _id: "6a4757c45d8d393b7cba351d", name: "Agape", level: "SENIOR_CELL", parentId: "6a468406ea710cf44881f884", createdAt: "2026-07-03T06:33:40.748Z" },
  { _id: "6a475858fdd908774ba21845", name: "Flourish", level: "SENIOR_CELL", parentId: "6a468406ea710cf44881f884", createdAt: "2026-07-03T06:36:08.519Z" },
  { _id: "6a46840c32abf8f0df5c812b", name: "Harvesters", level: "SENIOR_CELL", parentId: "6a468406ea710cf44881f884", createdAt: "2026-07-02T15:30:20.695Z" },
  { _id: "6a475861fdd908774ba2184a", name: "Manifestation", level: "SENIOR_CELL", parentId: "6a468406ea710cf44881f884", createdAt: "2026-07-03T06:36:17.838Z" },
  { _id: "6a47556a19bec0813a8abd2e", name: "Peculiar", level: "CELL", parentId: "6a4754c119bec0813a8abd29", createdAt: "2026-07-03T06:23:38.196Z" },
  { _id: "6a4758185d8d393b7cba3522", name: "Kingsmen", level: "CELL", parentId: "6a4757c45d8d393b7cba351d", createdAt: "2026-07-03T06:35:04.099Z" },
  { _id: "6a47582afdd908774ba21836", name: "Life changers", level: "CELL", parentId: "6a4757c45d8d393b7cba351d", createdAt: "2026-07-03T06:35:22.179Z" },
  { _id: "6a47583dfdd908774ba2183b", name: "Royal priesthood", level: "CELL", parentId: "6a4757c45d8d393b7cba351d", createdAt: "2026-07-03T06:35:41.161Z" },
  { _id: "6a475848fdd908774ba21840", name: "Trail Blazers", level: "CELL", parentId: "6a4757c45d8d393b7cba351d", createdAt: "2026-07-03T06:35:52.220Z" },
  { _id: "6a475879fdd908774ba21854", name: "Flourish", level: "CELL", parentId: "6a475858fdd908774ba21845", createdAt: "2026-07-03T06:36:41.948Z" },
  { _id: "6a47573d8a1f18b5eb5dcf86", name: "Harvesters", level: "CELL", parentId: "6a46840c32abf8f0df5c812b", createdAt: "2026-07-03T06:31:25.770Z" },
  { _id: "6a4757935d8d393b7cba3518", name: "Ecclesia", level: "CELL", parentId: "6a46840c32abf8f0df5c812b", createdAt: "2026-07-03T06:32:51.430Z" },
  { _id: "6a475a4d32e34dbb0c0b2ebd", name: "Manifestations", level: "CELL", parentId: "6a475861fdd908774ba2184a", createdAt: "2026-07-03T06:44:29.566Z" },
];

export async function getGroups(): Promise<ApiGroup[]> {
  try {
    const res = await fetch(GROUPS_ENDPOINT, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`groups fetch ${res.status}`);
    const data = (await res.json()) as ApiGroup[];
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_GROUPS;
  } catch {
    return FALLBACK_GROUPS;
  }
}

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

/** Groups with no children — where contacts are actually attributed. */
export function leafNodes(roots: GroupNode[]): GroupNode[] {
  const leaves: GroupNode[] = [];
  const walk = (n: GroupNode) => {
    if (n.children.length === 0) leaves.push(n);
    else n.children.forEach(walk);
  };
  roots.forEach(walk);
  return leaves;
}

/** Map every group id to its ancestor chain (self first, team last). */
export function ancestryMap(groups: ApiGroup[]): Map<string, ApiGroup[]> {
  const byId = new Map(groups.map((g) => [g._id, g]));
  const map = new Map<string, ApiGroup[]>();
  for (const g of groups) {
    const chain: ApiGroup[] = [];
    let cur: ApiGroup | undefined = g;
    while (cur) {
      chain.push(cur);
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    map.set(g._id, chain);
  }
  return map;
}
