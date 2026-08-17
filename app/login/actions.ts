"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { CALLERS } from "@/lib/callers";
import { outreachWired, isObjectId, outreachFetch } from "@/lib/outreach-api";
import {
  SESSION_COOKIE,
  cookieOptions,
  signAdminSession,
  signCallerSession,
} from "@/lib/auth";

const YEAR = 60 * 60 * 24 * 365;

/** Constant-time string compare (guards the length leak too). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export interface LoginResult {
  error?: string;
}

/**
 * Admin sign-in. When wired, the code is checked against the runtime code set
 * from the dashboard (scrypt hash in the outreach DB); if none is set there yet,
 * it falls back to the env `ADMIN_ACCESS_CODE` seed.
 */
export async function adminLogin(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const code = String(formData.get("code") ?? "");
  if (!code) return { error: "Enter the access code." };

  let ok = false;
  if (outreachWired()) {
    try {
      const res = await outreachFetch("/api/outreach/admin-code/verify", {
        method: "POST",
        body: { code },
      });
      if (res.configured) ok = Boolean(res.ok);
      else ok = envCodeMatches(code); // no DB code yet → env seed
    } catch {
      ok = envCodeMatches(code); // API hiccup → env seed still works
    }
  } else {
    ok = envCodeMatches(code);
  }

  if (!ok) return { error: "Wrong access code." };

  const store = await cookies();
  store.set(SESSION_COOKIE, await signAdminSession(), cookieOptions());
  redirect("/");
}

function envCodeMatches(code: string): boolean {
  const expected = process.env.ADMIN_ACCESS_CODE;
  return Boolean(expected) && safeEqual(code, expected!);
}

/**
 * Caller sign-in: name + 4-digit PIN. Mirrors setCaller — PIN checked
 * server-side (scrypt) when wired, else against the local stub — then mints a
 * scoped caller session AND sets the per-device caller_* cookies the /contacts
 * surface already reads.
 */
export async function callerLogin(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const callerId = String(formData.get("callerId") ?? "");
  const pin = String(formData.get("pin") ?? "");
  if (!callerId) return { error: "Pick your name." };
  if (!/^\d{4}$/.test(pin)) return { error: "Enter your 4-digit PIN." };

  let id = callerId;
  let name: string;
  let seniorCellId: string | null = null;
  let seniorCellName: string | null = null;

  if (outreachWired() && isObjectId(callerId)) {
    try {
      const data = await outreachFetch("/api/outreach/callers/verify", {
        method: "POST",
        body: { callerId, pin },
      });
      id = String(data.id);
      name = String(data.name);
      seniorCellId = data.seniorCellId ? String(data.seniorCellId) : null;
      seniorCellName = data.seniorCellName ? String(data.seniorCellName) : null;
    } catch {
      return { error: "Wrong PIN." };
    }
  } else {
    const caller = CALLERS.find((c) => c.id === callerId && c.active);
    if (!caller) return { error: "Pick your name." };
    if (caller.pin !== pin) return { error: "Wrong PIN." };
    name = caller.name;
    seniorCellId = caller.seniorCellId ?? null;
    seniorCellName = caller.seniorCellName ?? null;
  }

  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    await signCallerSession({
      callerId: id,
      name,
      ...(seniorCellId ? { seniorCellId, seniorCellName: seniorCellName ?? "" } : {}),
    }),
    cookieOptions()
  );

  // Per-device caller cookies (same contract as setCaller) so the log gate and
  // senior-cell scoping keep working inside /contacts.
  const opts = { path: "/", maxAge: YEAR, sameSite: "lax" as const };
  store.set("caller_id", id, opts);
  store.set("caller_name", name, opts);
  if (seniorCellId) {
    store.set("caller_senior_id", seniorCellId, opts);
    store.set("caller_senior_name", seniorCellName ?? "", opts);
  } else {
    store.delete("caller_senior_id");
    store.delete("caller_senior_name");
  }

  redirect("/contacts");
}

/** Sign out — clear the session and any per-device caller identity. */
export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete("caller_id");
  store.delete("caller_name");
  store.delete("caller_senior_id");
  store.delete("caller_senior_name");
  redirect("/login");
}
