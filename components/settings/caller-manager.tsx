"use client";

import { useState, useTransition } from "react";
import { Icon, Spinner } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCaller, deleteCaller, assignCaller } from "@/app/caller/actions";

interface RosterCaller {
  id: string;
  name: string;
  seniorCellId?: string | null;
  seniorCellName?: string | null;
}
interface SeniorCellOption {
  id: string;
  name: string;
  team: string;
}

const ALL_ACCESS = "__all__";

/**
 * Admin caller roster + registration. Callers sign in on their device with the
 * 4-digit PIN set here; every call log auto-carries their id. A caller assigned
 * a senior cell only sees that senior cell's contacts; unassigned = all-access.
 */
export function CallerManager({
  callers,
  seniorCells,
}: {
  callers: RosterCaller[];
  seniorCells: SeniorCellOption[];
}) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [seniorId, setSeniorId] = useState<string>(ALL_ACCESS);
  const [pending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function submit() {
    setMsg(null);
    const senior =
      seniorId === ALL_ACCESS
        ? null
        : (() => {
            const s = seniorCells.find((c) => c.id === seniorId);
            return s ? { id: s.id, name: s.name } : null;
          })();
    startTransition(async () => {
      const res = await createCaller(name, pin, senior);
      if (res.ok) {
        setMsg({ ok: true, text: `${name.trim()} registered.` });
        setName("");
        setPin("");
        setSeniorId(ALL_ACCESS);
      } else {
        setMsg({ ok: false, text: res.error ?? "Could not register." });
      }
    });
  }

  function reassign(id: string, callerName: string, nextSeniorId: string) {
    setMsg(null);
    setAssigningId(id);
    const senior =
      nextSeniorId === ALL_ACCESS
        ? null
        : (() => {
            const s = seniorCells.find((c) => c.id === nextSeniorId);
            return s ? { id: s.id, name: s.name } : null;
          })();
    startTransition(async () => {
      const res = await assignCaller(id, senior);
      setAssigningId(null);
      if (res.ok) {
        setMsg({
          ok: true,
          text: senior
            ? `${callerName} now scoped to ${senior.name}.`
            : `${callerName} set to all cells.`,
        });
      } else {
        setMsg({ ok: false, text: res.error ?? "Could not update assignment." });
      }
    });
  }

  function remove(id: string, callerName: string) {
    setMsg(null);
    setRemovingId(id);
    startTransition(async () => {
      const res = await deleteCaller(id);
      setRemovingId(null);
      if (res.ok) setMsg({ ok: true, text: `${callerName} removed.` });
      else setMsg({ ok: false, text: res.error ?? "Could not remove." });
    });
  }

  return (
    <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
      <div>
        <h2 className="text-base font-bold">Callers</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Register the volunteers working the phones — each signs in once per device with their PIN.
          Assign a senior cell to scope their call queue, or leave it open for all cells.
        </p>
      </div>

      {callers.length > 0 && (
        <ul className="divide-border/60 divide-y">
          {callers.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2.5 py-2.5">
              <span className="min-w-0 flex-1 text-sm font-semibold">{c.name}</span>
              <Select
                value={c.seniorCellId ?? ALL_ACCESS}
                onValueChange={(v) => reassign(c.id, c.name, v)}
                disabled={pending}
              >
                <SelectTrigger className="h-9 w-[200px] rounded-full text-xs">
                  {assigningId === c.id ? (
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                      <Spinner className="size-3.5 animate-spin" /> Saving…
                    </span>
                  ) : (
                    <SelectValue placeholder="All cells (no scope)" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ACCESS}>All cells (no scope)</SelectItem>
                  {seniorCells.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} · {s.team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => remove(c.id, c.name)}
                disabled={pending}
                aria-label={`Remove ${c.name}`}
                className="text-muted-foreground hover:bg-destructive hover:text-white flex size-7 items-center justify-center rounded-full transition-colors disabled:opacity-40"
              >
                {removingId === c.id ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Icon name="close" className="size-3.5" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="Caller name"
          className="bg-secondary placeholder:text-muted-foreground focus:ring-ring h-10 min-w-40 flex-1 rounded-full px-4 text-sm font-medium outline-none focus:ring-2"
        />
        <input
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          maxLength={4}
          placeholder="4-digit PIN"
          className="bg-secondary placeholder:text-muted-foreground focus:ring-ring h-10 w-32 rounded-full px-4 text-center text-sm font-bold tracking-widest tabular-nums outline-none focus:ring-2"
        />
        <Select value={seniorId} onValueChange={setSeniorId}>
          <SelectTrigger className="h-10 w-[190px] rounded-full">
            <SelectValue placeholder="Senior cell" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACCESS}>All cells (no scope)</SelectItem>
            {seniorCells.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} · {s.team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={submit}
          disabled={pending || name.trim().length < 2 || pin.length !== 4}
          className="bg-primary text-primary-foreground inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-xs font-bold disabled:opacity-40"
        >
          {pending ? <Spinner className="size-3.5 animate-spin" /> : <Icon name="user-plus" className="size-3.5" />}
          Register
        </button>
      </div>

      {msg && (
        <p
          className={`flex items-center gap-2 text-xs font-semibold ${
            msg.ok ? "text-[var(--team-2)]" : "text-destructive"
          }`}
        >
          {msg.ok ? <Icon name="success" className="size-4" /> : <Icon name="error" className="size-4" />}
          {msg.text}
        </p>
      )}
    </div>
  );
}
