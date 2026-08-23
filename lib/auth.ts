import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

/**
 * Stateless, signed-session auth.
 *
 * The session is a JWT signed with CALLCENTER_SESSION_SECRET, stored in an
 * httpOnly cookie. It carries a discriminated `role`:
 *   - { role: "admin",  tenantId }                    → the whole tenant
 *   - { role: "leader", tenantId, unitId, ... }       → that unit's subtree
 *
 * A leader is bound to a *unit at any depth*, not to a fixed tier. That single
 * change is what turns six hierarchy dashboards into one: authorisation is the
 * question "can this session's unit reach that unit by descending the tree?",
 * answered by `canReach` in lib/units.ts. A cell leader and a zone pastor run
 * the same code from different nodes.
 *
 * `proxy.ts` is the front door: anyone without a valid session is redirected
 * to /login. Verify is jose-only (Edge-safe) so it runs in the proxy.
 */

export type AdminSession = {
  role: "admin";
  tenantId?: string;
};

export type CallerSession = {
  role: "caller";
  callerId: string;
  name: string;
  seniorCellId?: string;
  seniorCellName?: string;
  tenantId?: string;
  unitId?: string;
  personId?: string;
};

export type LeaderSession = {
  role: "leader";
  tenantId: string;
  /** the unit this login is bound to — its subtree is everything it may see */
  unitId: string;
  /** the person record behind the login */
  personId: string;
  name: string;
  /** display label for the bound unit, e.g. "Kingsmen" */
  unitName?: string;
  /** which credential this login used — see credentialFor() in lib/levels.ts */
  credential?: "pin" | "password";
  /** set when a promotion has raised the unit above the PIN tier */
  mustSetPassword?: boolean;
};

export type Session = AdminSession | CallerSession | LeaderSession;
export type SessionPayload = Session & JWTPayload;

export const SESSION_COOKIE = "cc_session";
const SESSION_TTL = "12h";
const MAX_AGE = 60 * 60 * 12; // 12h — matches token TTL

function getSecret(): Uint8Array {
  const secret = process.env.CALLCENTER_SESSION_SECRET;
  if (!secret) {
    throw new Error("CALLCENTER_SESSION_SECRET is not defined in the environment");
  }
  return new TextEncoder().encode(secret);
}

/** Cookie options shared by every route that sets the session. */
export function cookieOptions(maxAge: number = MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function sign(payload: Session): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecret());
}

/** Mint a signed admin session — bound to the tenant root. */
export function signAdminSession(tenantId: string = "default"): Promise<string> {
  return sign({ role: "admin", tenantId });
}

/** Mint a signed caller session. */
export function signCallerSession(caller: Omit<CallerSession, "role">): Promise<string> {
  return sign({ role: "caller", ...caller });
}

/** Mint a signed leader session, scoped to one unit's subtree. */
export function signLeaderSession(
  leader: Omit<LeaderSession, "role">
): Promise<string> {
  return sign({ role: "leader", ...leader });
}

/**
 * Verify a raw token string. Edge-safe (jose only, no Node crypto) so it can be
 * called from the proxy as well as route handlers. Returns null on any
 * invalid/expired/tampered token.
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role === "admin") return payload as SessionPayload;
    if (
      payload.role === "caller" &&
      typeof payload.callerId === "string" &&
      typeof payload.name === "string"
    ) {
      return payload as SessionPayload;
    }
    if (
      payload.role === "leader" &&
      typeof payload.unitId === "string" &&
      typeof payload.personId === "string" &&
      typeof payload.name === "string"
    ) {
      return payload as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Read + verify the session from the request cookies. For Node-runtime route
 * handlers / server components (relies on next/headers).
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
