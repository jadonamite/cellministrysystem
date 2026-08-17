"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { Icon, Spinner } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { setCaller, clearCaller } from "@/app/caller/actions";

/**
 * Per-device caller gate. A call can only be logged while signed in as a caller,
 * so the whole /contacts surface is wrapped in this provider: it owns the single
 * PIN sign-in dialog and exposes `requireCaller()`, which the contact cards / row
 * actions call before opening the log dialog. Signed out → the PIN dialog opens
 * instead, and nothing is logged until a caller is confirmed.
 */
type Ctx = {
  callerName: string | null;
  signedIn: boolean;
  /** True if already signed in; otherwise opens the PIN dialog and returns false. */
  requireCaller: () => boolean;
  openSignIn: () => void;
  signOut: () => void;
};

const CallerGateContext = createContext<Ctx | null>(null);

export function useCallerGate(): Ctx {
  const ctx = useContext(CallerGateContext);
  if (!ctx) throw new Error("useCallerGate must be used within CallerGateProvider");
  return ctx;
}

export function CallerGateProvider({
  callerName,
  roster,
  children,
}: {
  callerName: string | null;
  roster: { id: string; name: string }[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [callerId, setCallerId] = useState("");
  const [pin, setPin] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const signedIn = Boolean(callerName);

  function requireCaller() {
    if (signedIn) return true;
    setOpen(true);
    return false;
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await setCaller(callerId, pin);
      if (res.ok) {
        setOpen(false);
        setPin("");
        setCallerId("");
      } else {
        setError(res.error ?? "Could not sign in.");
      }
    });
  }

  function signOut() {
    startTransition(() => clearCaller());
  }

  return (
    <CallerGateContext.Provider
      value={{ callerName, signedIn, requireCaller, openSignIn: () => setOpen(true), signOut }}
    >
      {children}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setError(null);
            setPin("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Who&apos;s calling?</DialogTitle>
            <DialogDescription>
              Pick your name and enter your 4-digit PIN. We&apos;ll remember you on
              this device — calls are logged under your name.
            </DialogDescription>
          </DialogHeader>

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

          <input
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="• • • •"
            className="bg-secondary placeholder:text-muted-foreground/50 focus:ring-ring h-11 rounded-2xl text-center text-lg font-bold tracking-[0.5em] outline-none focus:ring-2"
          />

          <div className="flex items-center justify-between gap-3">
            {error ? (
              <span className="text-destructive flex items-center gap-1.5 font-semibold">
                <Icon name="error" className="size-4" /> {error}
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={submit}
              disabled={!callerId || pin.length !== 4 || pending}
              className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-40"
            >
              {pending && <Spinner className="size-3.5 animate-spin" />}
              {pending ? "Checking…" : "Confirm"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </CallerGateContext.Provider>
  );
}
