import { cookies } from "next/headers";
import { COLLECTIONS, dbWired, unscoped } from "./db";
import type { Tenant } from "./types";

/**
 * Which zone's data this request is looking at.
 *
 * Every record is tenant-scoped, so this is resolved once per request and
 * threaded down rather than re-derived. Order of precedence: the signed
 * session's tenant (set at sign-in), then the single tenant if only one
 * exists — which is the case while Zone G is the only deployment.
 *
 * Server-only.
 */

const TENANT_COOKIE = "cms_tenant";

/** The only tenant, when exactly one is registered. */
async function soleTenantId(): Promise<string | null> {
  if (!dbWired()) return null;
  try {
    const tenants = await unscoped<Tenant & { _id: string }>(COLLECTIONS.tenants);
    const found = await tenants.find({}).limit(2).toArray();
    return found.length === 1 ? String(found[0]._id) : null;
  } catch {
    return null;
  }
}

/**
 * The active tenant id, or null when the database is unconfigured or no
 * tenant has signed up yet. Callers treat null as "render an empty app".
 */
export async function currentTenantId(): Promise<string | null> {
  const store = await cookies();
  const fromCookie = store.get(TENANT_COOKIE)?.value;
  if (fromCookie) return fromCookie;
  return soleTenantId();
}

export { TENANT_COOKIE };
