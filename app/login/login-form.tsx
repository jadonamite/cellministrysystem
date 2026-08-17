"use client";

import { useActionState, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Icon, Spinner, PhoneSolidIcon } from "@/components/icons";
import { adminLogin, callerLogin, type LoginResult } from "./actions";

type RosterCaller = { id: string; name: string };

const initial: LoginResult = {};

export function LoginForm({ roster }: { roster: RosterCaller[] }) {
  const [adminState, adminAction, adminPending] = useActionState(adminLogin, initial);
  const [callerState, callerAction, callerPending] = useActionState(callerLogin, initial);
  const [callerId, setCallerId] = useState("");
  const [pin, setPin] = useState("");

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="bg-primary text-primary-foreground mb-4 flex size-12 items-center justify-center rounded-2xl">
          <PhoneSolidIcon className="size-6" />
        </span>
        <h1 className="text-xl font-bold tracking-tight">CallCenter</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in to continue
        </p>
      </div>

      <Tabs defaultValue="caller" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="caller">Caller</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        {/* Caller — name + PIN */}
        <TabsContent value="caller">
          <form action={callerAction} className="space-y-4">
            <input type="hidden" name="callerId" value={callerId} />
            <input type="hidden" name="pin" value={pin} />

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold">
                Who&apos;s signing in?
              </p>
              <div className="flex flex-wrap gap-2">
                {roster.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCallerId(c.id)}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                      callerId === c.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <input
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="• • • •"
              className="bg-secondary placeholder:text-muted-foreground/50 focus:ring-ring h-12 w-full rounded-2xl text-center text-lg font-bold tracking-[0.5em] outline-none focus:ring-2"
            />

            {callerState.error && (
              <p className="text-destructive flex items-center gap-1.5 text-sm font-semibold">
                <Icon name="error" className="size-4" /> {callerState.error}
              </p>
            )}

            <button
              type="submit"
              disabled={!callerId || pin.length !== 4 || callerPending}
              className="bg-primary text-primary-foreground flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold disabled:opacity-40"
            >
              {callerPending && <Spinner className="size-4 animate-spin" />}
              {callerPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </TabsContent>

        {/* Admin — access code */}
        <TabsContent value="admin">
          <form action={adminAction} className="space-y-4">
            <input
              name="code"
              type="password"
              autoComplete="off"
              placeholder="Access code"
              className="bg-secondary placeholder:text-muted-foreground focus:ring-ring h-12 w-full rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2"
            />

            {adminState.error && (
              <p className="text-destructive flex items-center gap-1.5 text-sm font-semibold">
                <Icon name="error" className="size-4" /> {adminState.error}
              </p>
            )}

            <button
              type="submit"
              disabled={adminPending}
              className="bg-primary text-primary-foreground flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold disabled:opacity-40"
            >
              {adminPending && <Spinner className="size-4 animate-spin" />}
              {adminPending ? "Signing in…" : "Sign in as admin"}
            </button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
