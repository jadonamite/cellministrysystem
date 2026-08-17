/**
 * Thin server-side client for the e-register outreach API.
 *
 * The write-path server actions call through here. It is deliberately a no-op
 * gate until the API is configured: `outreachWired()` is false unless BOTH
 * env vars are set, so with no env the app stays on the demo stub. Even when
 * wired, id-scoped writes only go live for real Mongo ObjectIds — the demo's
 * string ids (`love-expression`, `c-tola`, …) fail `isObjectId` and fall back
 * to the stub, so a live key never breaks the demo dashboard.
 *
 * Server-only: reads secrets from process.env at call time. Never imported into
 * a client component.
 */

/** True once the live API base URL + key are both configured. */
export function outreachWired(): boolean {
  return Boolean(process.env.OUTREACH_API && process.env.OUTREACH_API_KEY);
}

/**
 * Mongo ObjectId shape. Demo ids are intentionally NOT 24-hex, so any write
 * scoped to a demo id stays on the stub even when the API is wired.
 */
export function isObjectId(id: string | undefined | null): boolean {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

type Json = Record<string, unknown>;

/** A write must not hang the caller on a weak link: abort and surface a retry. */
const WRITE_TIMEOUT_MS = 8000;

/**
 * POST/PATCH/DELETE JSON with the bearer key. Throws on non-2xx (message from
 * the API) and aborts after WRITE_TIMEOUT_MS so a stalled network fails fast to
 * a friendly retry instead of a frozen UI.
 */
export async function outreachFetch(
  path: string,
  init: { method: "POST" | "PATCH" | "DELETE"; body: Json }
): Promise<Json> {
  let res: Response;
  try {
    res = await fetch(`${process.env.OUTREACH_API}${path}`, {
      method: init.method,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OUTREACH_API_KEY}`,
      },
      body: JSON.stringify(init.body),
      cache: "no-store",
      signal: AbortSignal.timeout(WRITE_TIMEOUT_MS),
    });
  } catch (e) {
    const name = (e as Error).name;
    if (name === "TimeoutError" || name === "AbortError")
      throw new Error("Network's slow — that didn't send. Check your connection and try again.");
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  const data = (await res.json().catch(() => ({}))) as Json;
  if (!res.ok) throw new Error((data.error as string) || `Request failed (${res.status})`);
  return data;
}
