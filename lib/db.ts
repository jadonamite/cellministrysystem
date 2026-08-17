import { MongoClient, type Db, type Collection, type Document, type Filter } from "mongodb";

/**
 * Database access, tenant-scoped at the source.
 *
 * Cross-tenant leakage is the one bug class here that cannot be recovered
 * from: a cell leader in one zone seeing another zone's members is not a
 * display glitch, it is a breach. So tenant filtering does not live in
 * individual queries where it can be forgotten — every collection is reached
 * through `scoped()`, which folds `tenantId` into the filter of every read and
 * onto the body of every write.
 *
 * Server-only: reads MONGODB_URI at call time. Never import into a client
 * component.
 */

/** True once the database is configured. Until then the app runs empty. */
export function dbWired(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

const DB_NAME = process.env.MONGODB_DB || "cellministry";

/**
 * One client per process, reused across invocations. Serverless keeps the
 * module alive between requests, so caching the promise avoids opening a new
 * pool on every call; in dev it survives HMR via a global.
 */
declare global {
  // eslint-disable-next-line no-var
  var _cmsMongo: Promise<MongoClient> | undefined;
}

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined in the environment");
  if (!global._cmsMongo) {
    global._cmsMongo = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    }).connect();
  }
  return global._cmsMongo;
}

export async function db(): Promise<Db> {
  return (await client()).db(DB_NAME);
}

export const COLLECTIONS = {
  tenants: "tenants",
  levels: "levels",
  units: "units",
  people: "people",
  promotions: "promotions",
  logins: "logins",
  attendance: "attendance_snapshots",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * A collection view locked to one tenant. Reads have `tenantId` folded into
 * the filter; inserts have it folded onto the document. There is deliberately
 * no escape hatch that returns the raw collection with a tenant argument —
 * use `unscoped()` only for genuinely global data (the tenant registry).
 */
export interface Scoped<T extends Document> {
  find(filter?: Filter<T>): Promise<T[]>;
  findOne(filter?: Filter<T>): Promise<T | null>;
  insert(doc: Omit<T, "tenantId">): Promise<void>;
  insertMany(docs: Omit<T, "tenantId">[]): Promise<void>;
  update(filter: Filter<T>, set: Partial<T>): Promise<void>;
  count(filter?: Filter<T>): Promise<number>;
  raw(): Promise<Collection<T>>;
}

export async function scoped<T extends Document>(
  name: CollectionName,
  tenantId: string
): Promise<Scoped<T>> {
  const collection = (await db()).collection<T>(name);
  const withTenant = (filter: Filter<T> = {}): Filter<T> =>
    ({ ...filter, tenantId } as Filter<T>);

  return {
    async find(filter) {
      return (await collection.find(withTenant(filter)).toArray()) as T[];
    },
    async findOne(filter) {
      return (await collection.findOne(withTenant(filter))) as T | null;
    },
    async insert(doc) {
      await collection.insertOne({ ...doc, tenantId } as never);
    },
    async insertMany(docs) {
      if (docs.length === 0) return;
      await collection.insertMany(docs.map((d) => ({ ...d, tenantId })) as never);
    },
    async update(filter, set) {
      await collection.updateOne(withTenant(filter), { $set: set as never });
    },
    async count(filter) {
      return collection.countDocuments(withTenant(filter));
    },
    async raw() {
      return collection;
    },
  };
}

/** For genuinely tenant-less data only — the tenant registry itself. */
export async function unscoped<T extends Document>(
  name: CollectionName
): Promise<Collection<T>> {
  return (await db()).collection<T>(name);
}
