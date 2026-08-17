import { ApiGroup, GroupNode } from "./types";

const GROUPS_ENDPOINT = "https://e-register-nine.vercel.app/api/groups";

/**
 * The cell hierarchy is owned by e-register and always read live. No local
 * snapshot is kept: if the endpoint is unreachable the tree renders empty
 * rather than showing a stale copy of the structure.
 */
export async function getGroups(): Promise<ApiGroup[]> {
  try {
    const res = await fetch(GROUPS_ENDPOINT, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`groups fetch ${res.status}`);
    const data = (await res.json()) as ApiGroup[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
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
