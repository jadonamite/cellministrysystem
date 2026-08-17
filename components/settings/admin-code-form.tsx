"use client";

import { useActionState, useEffect, useRef } from "react";
import { Icon, Spinner } from "@/components/icons";
import { changeAdminCode, type AdminCodeResult } from "@/app/settings/actions";

const initial: AdminCodeResult = {};

/** Admin: change the shared access code used to sign in to the dashboard. */
export function AdminCodeForm() {
  const [state, action, pending] = useActionState(changeAdminCode, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
      <div>
        <h2 className="text-base font-bold">Admin access code</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          The shared code admins type to sign in. Changing it takes effect
          immediately for everyone.
        </p>
      </div>
      <form ref={formRef} action={action} className="flex flex-wrap gap-2.5">
        <input
          name="code"
          type="password"
          autoComplete="off"
          minLength={4}
          placeholder="New access code"
          className="bg-secondary placeholder:text-muted-foreground focus:ring-ring h-10 flex-1 rounded-full px-4 text-sm font-medium outline-none focus:ring-2 sm:min-w-56"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 text-xs font-bold disabled:opacity-40"
        >
          {pending && <Spinner className="size-3.5 animate-spin" />}
          {pending ? "Saving…" : "Update code"}
        </button>
      </form>
      {state.ok ? (
        <p className="flex items-center gap-2 text-[11px] font-semibold text-[var(--team-2)]">
          <Icon name="success" className="size-4 shrink-0" /> Access code updated.
        </p>
      ) : state.error ? (
        <p className="text-destructive flex items-center gap-2 text-[11px] font-semibold">
          <Icon name="error" className="size-4 shrink-0" /> {state.error}
        </p>
      ) : null}
    </div>
  );
}
