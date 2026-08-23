"use client";

import { useActionState, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Icon, Spinner } from "@/components/icons";
import { adminLogin, callerLogin, type LoginResult } from "./actions";

type RosterCaller = { id: string; name: string };

const initial: LoginResult = {};

export function LoginForm({ roster }: { roster: RosterCaller[] }) {
  const [adminState, adminAction, adminPending] = useActionState(adminLogin, initial);
  const [callerState, callerAction, callerPending] = useActionState(callerLogin, initial);
  const [callerId, setCallerId] = useState("");
  const [pin, setPin] = useState("");

  return (
    <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-zinc-950/5 transition-all dark:border-white/[0.12] dark:bg-zinc-900/85 dark:shadow-2xl dark:shadow-black/60 backdrop-blur-2xl">
      {/* Top subtle gloss rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-white/20" />

      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Leadership Access
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1.5 text-xs font-normal">
          Sign in to monitor flock health, roster, and promotions
        </p>
      </div>

      <Tabs defaultValue="caller" className="w-full space-y-6">
        {/* Apple/shadcn Segmented Control with recessed track & floating active pill */}
        <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl border border-zinc-200/80 bg-zinc-100 p-1 dark:border-white/10 dark:bg-zinc-950/80">
          <TabsTrigger
            value="caller"
            className="flex h-full items-center justify-center gap-2 rounded-lg text-xs font-semibold tracking-tight text-zinc-500 transition-all duration-200 data-[state=active]:border data-[state=active]:border-zinc-200/60 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:text-zinc-400 dark:data-[state=active]:border-white/10 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:data-[state=active]:shadow-sm cursor-pointer"
          >
            <Icon name="user-circle" className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Cell Leader</span>
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="flex h-full items-center justify-center gap-2 rounded-lg text-xs font-semibold tracking-tight text-zinc-500 transition-all duration-200 data-[state=active]:border data-[state=active]:border-zinc-200/60 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:text-zinc-400 dark:data-[state=active]:border-white/10 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:data-[state=active]:shadow-sm cursor-pointer"
          >
            <Icon name="shield-check" className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Admin</span>
          </TabsTrigger>
        </TabsList>

        {/* Cell Leader Login Tab */}
        <TabsContent value="caller" className="mt-0 focus-visible:outline-none">
          <form action={callerAction} className="space-y-5">
            <input type="hidden" name="callerId" value={callerId} />
            <input type="hidden" name="pin" value={pin} />

            <div className="space-y-2">
              <label className="text-zinc-500 dark:text-zinc-400 block text-[11px] font-semibold uppercase tracking-wider">
                Select Your Name
              </label>
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto py-1">
                {roster.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCallerId(c.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                      callerId === c.id
                        ? "bg-zinc-950 text-white shadow-sm font-semibold dark:bg-purple-600 dark:text-white"
                        : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-white/10 dark:hover:bg-zinc-800 dark:hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-zinc-500 dark:text-zinc-400 block text-[11px] font-semibold uppercase tracking-wider">
                4-Digit Leader PIN
              </label>
              <input
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="• • • •"
                className="h-13 w-full rounded-xl border border-zinc-200 bg-zinc-50 text-center text-lg font-bold tracking-[0.5em] text-zinc-950 placeholder:text-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-purple-500 dark:focus:bg-zinc-950 dark:focus:ring-purple-500/20"
              />
            </div>

            {callerState.error && (
              <p className="text-red-500 dark:text-red-400 flex items-center gap-1.5 text-xs font-semibold">
                <Icon name="error" className="size-4 shrink-0" /> {callerState.error}
              </p>
            )}

            {/* Classic High-Contrast Pill Action Button */}
            <button
              type="submit"
              disabled={!callerId || pin.length !== 4 || callerPending}
              className="group relative flex h-13 w-full items-center justify-between overflow-hidden rounded-full bg-zinc-900 px-5 font-semibold text-white shadow-md shadow-zinc-900/10 transition-all duration-200 hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <span className="text-sm font-semibold tracking-tight">
                {callerPending ? "Signing in…" : "Sign in as Leader"}
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-white text-zinc-900 transition-transform duration-200 group-hover:translate-x-1 dark:bg-zinc-900 dark:text-white">
                {callerPending ? (
                  <Spinner className="size-4 text-zinc-900 dark:text-white" />
                ) : (
                  <Icon name="arrow-right" className="size-4" />
                )}
              </span>
            </button>
          </form>
        </TabsContent>

        {/* Admin Login Tab */}
        <TabsContent value="admin" className="mt-0 focus-visible:outline-none">
          <form action={adminAction} className="space-y-5">
            <div className="space-y-2">
              <label className="text-zinc-500 dark:text-zinc-400 block text-[11px] font-semibold uppercase tracking-wider">
                Admin Credential
              </label>
              <div className="relative">
                <input
                  name="code"
                  type="password"
                  autoComplete="off"
                  placeholder="Enter access code"
                  className="h-13 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-purple-500 dark:focus:bg-zinc-950 dark:focus:ring-purple-500/20"
                />
              </div>
            </div>

            {adminState.error && (
              <p className="text-red-500 dark:text-red-400 flex items-center gap-1.5 text-xs font-semibold">
                <Icon name="error" className="size-4 shrink-0" /> {adminState.error}
              </p>
            )}

            {/* Classic High-Contrast Pill Action Button */}
            <button
              type="submit"
              disabled={adminPending}
              className="group relative flex h-13 w-full items-center justify-between overflow-hidden rounded-full bg-zinc-900 px-5 font-semibold text-white shadow-md shadow-zinc-900/10 transition-all duration-200 hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none cursor-pointer dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <span className="text-sm font-semibold tracking-tight">
                {adminPending ? "Signing in…" : "Sign in as Admin"}
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-white text-zinc-900 transition-transform duration-200 group-hover:translate-x-1 dark:bg-zinc-900 dark:text-white">
                {adminPending ? (
                  <Spinner className="size-4 text-zinc-900 dark:text-white" />
                ) : (
                  <Icon name="arrow-right" className="size-4" />
                )}
              </span>
            </button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
