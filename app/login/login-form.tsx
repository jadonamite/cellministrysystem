"use client";

import { useActionState, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Icon } from "@/components/icons";
import { ArrowRight, Loader2, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { adminLogin, callerLogin, type LoginResult } from "./actions";

type RosterCaller = { id: string; name: string };

const initial: LoginResult = {};

export function LoginForm({ roster }: { roster: RosterCaller[] }) {
  const [adminState, adminAction, adminPending] = useActionState(adminLogin, initial);
  const [callerState, callerAction, callerPending] = useActionState(callerLogin, initial);
  const [callerId, setCallerId] = useState("");
  const [pin, setPin] = useState("");

  return (
    <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Leadership Access
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Sign in to monitor flock health, roster, and promotions
        </p>
      </div>

      <Tabs defaultValue="caller" className="w-full space-y-6">
        {/* Rich Premium Shadcn Segmented Slider */}
        <TabsList className="grid h-14 w-full grid-cols-2 rounded-2xl border border-border/50 bg-secondary/80 p-1.5 shadow-inner">
          <TabsTrigger
            value="caller"
            className="flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 data-active:border data-active:border-border/60 data-active:bg-background data-active:text-foreground data-active:shadow-md"
          >
            <UserCheck className="size-4 text-primary" />
            <span>Cell Leader</span>
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 data-active:border data-active:border-border/60 data-active:bg-background data-active:text-foreground data-active:shadow-md"
          >
            <ShieldCheck className="size-4 text-primary" />
            <span>Admin / Senior</span>
          </TabsTrigger>
        </TabsList>

        {/* Cell Leader Login Tab */}
        <TabsContent value="caller" className="mt-0 focus-visible:outline-none">
          <form action={callerAction} className="space-y-5">
            <input type="hidden" name="callerId" value={callerId} />
            <input type="hidden" name="pin" value={pin} />

            <div className="space-y-2">
              <label className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
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
                        ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30 font-semibold"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border/40"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
                4-Digit Leader PIN
              </label>
              <input
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="• • • •"
                className="bg-secondary/60 text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:ring-primary/20 h-13 w-full rounded-2xl border border-border/50 text-center text-xl font-bold tracking-[0.6em] outline-none transition-all focus:ring-4"
              />
            </div>

            {callerState.error && (
              <p className="text-destructive flex items-center gap-1.5 text-xs font-semibold animate-shake">
                <Icon name="error" className="size-4 shrink-0" /> {callerState.error}
              </p>
            )}

            {/* Signature Lading-style Sliding Arrow Action Button */}
            <button
              type="submit"
              disabled={!callerId || pin.length !== 4 || callerPending}
              className="group relative flex h-13 w-full items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-500 hover:shadow-xl hover:shadow-primary/35 hover:brightness-105 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2 transition-all duration-500 group-hover:-translate-x-2.5">
                {callerPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign in as Leader</span>
                )}
              </span>
              {!callerPending && (
                <span className="bg-primary-foreground text-primary absolute right-1.5 flex size-10 items-center justify-center rounded-full transition-all duration-500 group-hover:right-[calc(100%-46px)] group-hover:rotate-45 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
                  <ArrowRight className="size-4" />
                </span>
              )}
            </button>
          </form>
        </TabsContent>

        {/* Admin Login Tab */}
        <TabsContent value="admin" className="mt-0 focus-visible:outline-none">
          <form action={adminAction} className="space-y-5">
            <div className="space-y-2">
              <label className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider">
                Admin / Senior Credential
              </label>
              <div className="relative">
                <input
                  name="code"
                  type="password"
                  autoComplete="off"
                  placeholder="Enter access code or password"
                  className="bg-secondary/60 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 h-13 w-full rounded-2xl border border-border/50 px-4 pl-11 text-sm font-medium outline-none transition-all focus:ring-4"
                />
                <Lock className="text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 size-4" />
              </div>
            </div>

            {adminState.error && (
              <p className="text-destructive flex items-center gap-1.5 text-xs font-semibold animate-shake">
                <Icon name="error" className="size-4 shrink-0" /> {adminState.error}
              </p>
            )}

            {/* Signature Lading-style Action Button */}
            <button
              type="submit"
              disabled={adminPending}
              className="group relative flex h-13 w-full items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25 transition-all duration-500 hover:shadow-xl hover:shadow-primary/35 hover:brightness-105 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2 transition-all duration-500 group-hover:-translate-x-2.5">
                {adminPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign in as Admin</span>
                )}
              </span>
              {!adminPending && (
                <span className="bg-primary-foreground text-primary absolute right-1.5 flex size-10 items-center justify-center rounded-full transition-all duration-500 group-hover:right-[calc(100%-46px)] group-hover:rotate-45 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
                  <ArrowRight className="size-4" />
                </span>
              )}
            </button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
