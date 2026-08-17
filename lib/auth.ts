import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

/**
 * Stateless, signed-session auth for the call center itself.
 *
 * The session is a JWT signed with CALLCENTER_SESSION_SECRET, stored in an
 * httpOnly cookie. It carries a discriminated `role`:
 *   - { role: "admin" }                         → full app (dashboard + admin)
 *   - { role: "caller", callerId, name, ... }   → scoped to /contacts only
 *
 * This is the front door: `proxy.ts` redirects anyone without a valid session
 * to /login. It sits above the per-device caller PIN gate (see caller-gate.tsx),
 * which still governs whether an individual call may be logged.
 *
 * Signed → the browser can't forge it. Stateless → no server store, viable on
 * Vercel serverless. Verify is jose-only (Edge-safe) so it runs in the proxy.
 */

export type AdminSession = { role: "admin" };
export type CallerSession = {
  role: "caller";
  callerId: string;
  name: string;
  seniorCellId?: string;
  seniorCellName?: string;
};
export type Session = AdminSession | CallerSession;
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

/** Mint a signed admin session (full access). */
export function signAdminSession(): Promise<string> {
  return sign({ role: "admin" });
}

/** Mint a signed caller session, scoped to /contacts. */
export function signCallerSession(caller: Omit<CallerSession, "role">): Promise<string> {
  return sign({ role: "caller", ...caller });
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
