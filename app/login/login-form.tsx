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
    <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-white/[0.12] bg-zinc-900/75 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl transition-all">
      {/* Top subtle gloss rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="mb-7 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Leadership Access
        </h2>
        <p className="text-zinc-400 mt-1.5 text-xs font-normal">
          Sign in to monitor flock health, roster, and promotions
        </p>
      </div>

      <Tabs defaultValue="caller" className="w-full space-y-6">
        {/* Rich Elevated Segment Slider */}
        <TabsList className="grid h-13 w-full grid-cols-2 rounded-2xl border border-white/[0.08] bg-zinc-950/70 p-1">
          <TabsTrigger
            value="caller"
            className="flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-semibold tracking-wide text-zinc-400 transition-all duration-300 data-active:border data-active:border-white/15 data-active:bg-zinc-800/90 data-active:text-white data-active:shadow-lg"
          >
            <Icon name="user-circle" className="size-4 text-purple-400 shrink-0" />
            <span>Cell Leader</span>
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-semibold tracking-wide text-zinc-400 transition-all duration-300 data-active:border data-active:border-white/15 data-active:bg-zinc-800/90 data-active:text-white data-active:shadow-lg"
          >
            <Icon name="shield-check" className="size-4 text-purple-400 shrink-0" />
            <span>Admin</span>
          </TabsTrigger>
        </TabsList>

        {/* Cell Leader Login Tab */}
        <TabsContent value="caller" className="mt-0 focus-visible:outline-none">
          <form action={callerAction} className="space-y-5">
            <input type="hidden" name="callerId" value={callerId} />
            <input type="hidden" name="pin" value={pin} />

            <div className="space-y-2">
              <label className="text-zinc-400 block text-[11px] font-semibold uppercase tracking-wider">
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
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-white/20 font-semibold"
                        : "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/5"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-zinc-400 block text-[11px] font-semibold uppercase tracking-wider">
                4-Digit Leader PIN
              </label>
              <input
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="• • • •"
                className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950/60 text-center text-xl font-bold tracking-[0.6em] text-white placeholder:text-zinc-600 outline-none transition-all focus:border-purple-500 focus:bg-zinc-950 focus:ring-4 focus:ring-purple-500/20"
              />
            </div>

            {callerState.error && (
              <p className="text-red-400 flex items-center gap-1.5 text-xs font-semibold">
                <Icon name="error" className="size-4 shrink-0" /> {callerState.error}
              </p>
            )}

            {/* Classic High-Contrast Pill Action Button */}
            <button
              type="submit"
              disabled={!callerId || pin.length !== 4 || callerPending}
              className="group relative flex h-14 w-full items-center justify-between overflow-hidden rounded-full bg-white px-6 font-semibold text-zinc-950 shadow-lg shadow-white/5 transition-all duration-300 hover:bg-zinc-100 hover:shadow-xl hover:shadow-purple-500/10 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              <span className="text-sm font-semibold tracking-tight">
                {callerPending ? "Signing in…" : "Sign in as Leader"}
              </span>
              <span className="flex size-10 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform duration-300 group-hover:translate-x-1">
                {callerPending ? (
                  <Spinner className="size-4 text-white" />
                ) : (
                  <Icon name="arrow-right" className="size-4 text-white" />
                )}
              </span>
            </button>
          </form>
        </TabsContent>

        {/* Admin Login Tab */}
        <TabsContent value="admin" className="mt-0 focus-visible:outline-none">
          <form action={adminAction} className="space-y-5">
            <div className="space-y-2">
              <label className="text-zinc-400 block text-[11px] font-semibold uppercase tracking-wider">
                Admin Credential
              </label>
              <div className="relative">
                <input
                  name="code"
                  type="password"
                  autoComplete="off"
                  placeholder="Enter access code"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-5 text-sm font-medium text-white placeholder:text-zinc-600 outline-none transition-all focus:border-purple-500 focus:bg-zinc-950 focus:ring-4 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {adminState.error && (
              <p className="text-red-400 flex items-center gap-1.5 text-xs font-semibold">
                <Icon name="error" className="size-4 shrink-0" /> {adminState.error}
              </p>
            )}

            {/* Classic High-Contrast Pill Action Button */}
            <button
              type="submit"
              disabled={adminPending}
              className="group relative flex h-14 w-full items-center justify-between overflow-hidden rounded-full bg-white px-6 font-semibold text-zinc-950 shadow-lg shadow-white/5 transition-all duration-300 hover:bg-zinc-100 hover:shadow-xl hover:shadow-purple-500/10 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              <span className="text-sm font-semibold tracking-tight">
                {adminPending ? "Signing in…" : "Sign in as Admin"}
              </span>
              <span className="flex size-10 items-center justify-center rounded-full bg-zinc-950 text-white transition-transform duration-300 group-hover:translate-x-1">
                {adminPending ? (
                  <Spinner className="size-4 text-white" />
                ) : (
                  <Icon name="arrow-right" className="size-4 text-white" />
                )}
              </span>
            </button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
