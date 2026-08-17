"use client";

import { Icon } from "@/components/icons";
import { logout } from "@/app/login/actions";
import { useCallerGate } from "./caller-gate";

/**
 * Caller identity strip. Reads the shared caller gate: shows who's signed in
 * (calls log under this name) or prompts to sign in. The actual PIN dialog lives
 * in CallerGateProvider so calling is gated on it everywhere on the page.
 *
 * "switch" clears the per-device caller (hand the phone to a teammate mid-shift);
 * "Sign out" ends the whole session and returns to /login — the caller's only
 * exit, since /settings is admin-scoped.
 */
export function CallerBar() {
  const { callerName, openSignIn, signOut } = useCallerGate();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
      <div className="flex items-center gap-2">
        <Icon name="user" className="text-muted-foreground size-3.5" />
        {callerName ? (
          <>
            <span className="text-muted-foreground">
              Calling as <b className="text-foreground">{callerName}</b>
            </span>
            <button
              type="button"
              onClick={signOut}
              className="text-primary font-semibold hover:underline"
            >
              switch
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={openSignIn}
            className="text-primary font-semibold hover:underline"
          >
            Sign in as a caller to log calls
          </button>
        )}
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="text-destructive hover:bg-destructive inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1 font-semibold transition-colors hover:text-white"
        >
          <Icon name="logout" className="size-3.5" /> Sign out
        </button>
      </form>
    </div>
  );
}
