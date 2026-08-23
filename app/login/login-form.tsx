"use client";

import { useActionState, useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Icon, Spinner } from "@/components/icons";
import { adminLogin, callerLogin, type LoginResult } from "./actions";

type RosterCaller = { id: string; name: string };

const initial: LoginResult = {};

/** 4-Box OTP PIN Input with shimmering glowing accent borders */
function OtpPinInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const input0 = useRef<HTMLInputElement>(null);
  const input1 = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const input3 = useRef<HTMLInputElement>(null);
  const refs = [input0, input1, input2, input3];

  const digits = [value[0] || "", value[1] || "", value[2] || "", value[3] || ""];

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      const next = value.split("");
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    if (raw.length > 1) {
      const clean = raw.slice(0, 4);
      onChange(clean);
      const targetIndex = Math.min(clean.length, 3);
      refs[targetIndex]?.current?.focus();
      return;
    }

    const char = raw[raw.length - 1];
    const next = [...digits];
    next[index] = char;
    const combined = next.join("");
    onChange(combined);

    if (index < 3 && char) {
      refs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs[index - 1]?.current?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs[index - 1]?.current?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      refs[index + 1]?.current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted) {
      onChange(pasted);
      const targetIndex = Math.min(pasted.length, 3);
      refs[targetIndex]?.current?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3 sm:gap-4 py-2">
      {[0, 1, 2, 3].map((i) => {
        const isFilled = Boolean(digits[i]);
        return (
          <div key={i} className="relative group">
            {/* Shimmer / Glow halo when filled */}
            {isFilled && (
              <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-400 to-fuchsia-500 opacity-70 blur-md animate-pulse transition-opacity duration-300 dark:opacity-60" />
            )}
            <input
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[i]}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={`relative size-14 sm:size-15 rounded-2xl text-center text-2xl font-bold transition-all duration-300 outline-none select-none ${
                isFilled
                  ? "border-2 border-purple-500 bg-purple-50/90 text-purple-900 shadow-[0_0_20px_rgba(147,51,234,0.35)] dark:border-purple-400 dark:bg-purple-950/50 dark:text-purple-200 dark:shadow-[0_0_25px_rgba(168,85,247,0.45)] scale-105"
                  : "border border-zinc-200/90 bg-white/70 text-zinc-950 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-600/15 focus:scale-105 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white dark:focus:border-purple-400 dark:focus:bg-zinc-900 dark:focus:ring-purple-500/25"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

export function LoginForm({ roster }: { roster: RosterCaller[] }) {
  const [adminState, adminAction, adminPending] = useActionState(adminLogin, initial);
  const [callerState, callerAction, callerPending] = useActionState(callerLogin, initial);
  const [callerId, setCallerId] = useState("");
  const [pin, setPin] = useState("");

  return (
    <div className="relative w-full max-w-[430px] overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-8 sm:p-10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-3xl transition-all dark:border-white/[0.14] dark:bg-zinc-900/60 dark:shadow-[0_40px_90px_-20px_rgba(0,0,0,0.8)]">
      {/* Top specular gloss rim */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/25" />

      <div className="mb-7 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Leadership Access
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1.5 text-xs font-normal">
          Sign in to monitor flock health, roster, and promotions
        </p>
      </div>

      <Tabs defaultValue="caller" className="w-full space-y-6">
        {/* Executive Switcher with micro status indicators */}
        <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl border border-zinc-200/80 bg-zinc-100/90 p-1 dark:border-white/10 dark:bg-zinc-950/80">
          <TabsTrigger
            value="caller"
            className="flex h-full items-center justify-center gap-2 rounded-lg text-xs font-semibold tracking-tight text-zinc-500 transition-all duration-200 data-[state=active]:border data-[state=active]:border-zinc-200/60 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:text-zinc-400 dark:data-[state=active]:border-white/10 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:data-[state=active]:shadow-sm cursor-pointer"
          >
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse shrink-0" />
            <span>Cell Leader</span>
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="flex h-full items-center justify-center gap-2 rounded-lg text-xs font-semibold tracking-tight text-zinc-500 transition-all duration-200 data-[state=active]:border data-[state=active]:border-zinc-200/60 data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm dark:text-zinc-400 dark:data-[state=active]:border-white/10 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white dark:data-[state=active]:shadow-sm cursor-pointer"
          >
            <span className="size-2 rounded-full bg-purple-500 shadow-[0_0_8px_#8B5CF6] shrink-0" />
            <span>Admin</span>
          </TabsTrigger>
        </TabsList>

        {/* Cell Leader Login Tab */}
        <TabsContent value="caller" className="mt-0 focus-visible:outline-none">
          <form action={callerAction} className="space-y-6">
            <input type="hidden" name="callerId" value={callerId} />
            <input type="hidden" name="pin" value={pin} />

            <div className="space-y-2.5">
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
                        : "bg-white/80 text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-white/10 dark:hover:bg-zinc-800 dark:hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-zinc-500 dark:text-zinc-400 block text-center text-[11px] font-semibold uppercase tracking-wider">
                Enter 4-Digit Leader PIN
              </label>
              <OtpPinInput value={pin} onChange={setPin} />
            </div>

            {callerState.error && (
              <p className="text-red-500 dark:text-red-400 flex items-center justify-center gap-1.5 text-xs font-semibold">
                <Icon name="error" className="size-4 shrink-0" /> {callerState.error}
              </p>
            )}

            {/* Classic High-Contrast Action Button */}
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
          <form action={adminAction} className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-zinc-500 dark:text-zinc-400 block text-[11px] font-semibold uppercase tracking-wider">
                Admin Access Credential
              </label>
              <div className="relative">
                <input
                  name="code"
                  type="password"
                  autoComplete="off"
                  placeholder="Enter access code"
                  className="h-13 w-full rounded-xl border border-zinc-200/90 bg-white/70 px-4 text-sm font-medium text-zinc-950 placeholder:text-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-purple-500 dark:focus:bg-zinc-950 dark:focus:ring-purple-500/20"
                />
              </div>
            </div>

            {adminState.error && (
              <p className="text-red-500 dark:text-red-400 flex items-center justify-center gap-1.5 text-xs font-semibold">
                <Icon name="error" className="size-4 shrink-0" /> {adminState.error}
              </p>
            )}

            {/* Classic High-Contrast Action Button */}
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
