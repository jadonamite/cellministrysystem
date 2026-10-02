"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { outreachWired, outreachFetch } from "@/lib/outreach-api";

export interface AdminCodeResult {
  ok?: boolean;
  error?: string;
}

/**
 * Admin: change the shared access code from the dashboard. Persists a scrypt
 * hash server-side via the outreach API, so it takes effect everywhere (the env
 * `ADMIN_ACCESS_CODE` stays as the seed/fallback until one is set here).
 */
export async function changeAdminCode(
  _prev: AdminCodeResult,
  formData: FormData
): Promise<AdminCodeResult> {
  const session = await getSession();
  if (session?.role !== "admin") return { error: "Admins only." };

  const code = String(formData.get("code") ?? "").trim();
  if (code.length < 4) return { error: "Code must be at least 4 characters." };

  if (!outreachWired()) {
    return { error: "Connect the outreach API to change the code." };
  }
  try {
    await outreachFetch("/api/outreach/admin-code", { method: "POST", body: { code } });
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function saveAdminName(formData: FormData) {
  const name = formData.get("name");
  if (typeof name !== "string") return;
  const clean = name.trim().slice(0, 40);
  const store = await cookies();
  if (clean) store.set("admin_name", clean, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  else store.delete("admin_name");
  revalidatePath("/", "layout");
}

/** Remove the admin — the greeting falls back to the default "Admin". */
export async function clearAdminName() {
  const store = await cookies();
  store.delete("admin_name");
  revalidatePath("/", "layout");
}

/**
 * The invite message used by the WhatsApp deep link (and seeded into the SMS
 * composer). Tokens {name}/{event} fill in per contact. Cookie-backed until the
 * outreach API stores it per event.
 */
export async function saveInviteTemplate(formData: FormData) {
  const template = formData.get("template");
  if (typeof template !== "string") return;
  const clean = template.trim().slice(0, 500);
  const store = await cookies();
  if (clean) store.set("invite_template", clean, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  else store.delete("invite_template");
  revalidatePath("/", "layout");
}
