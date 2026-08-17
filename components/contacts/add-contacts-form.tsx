"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Icon, Spinner } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GroupNode } from "@/lib/types";
import { saveContacts, type SaveContactsResult } from "@/app/contacts/new/actions";

interface ParsedRow {
  name: string;
  phone: string;
  /** optional 3rd column — where the contact is coming from */
  location: string;
  valid: boolean;
  reason?: string;
}

/** A Nigerian mobile number, tolerant of spaces and a +234 prefix. */
const PHONE_RE = /(\+?234\d[\d\s]{8,12}|0\d[\d\s]{9,13})/;
/** A caller's leading list index — "12.", "5)", "3 -", "18  " — never a name. */
const SERIAL_RE = /^\s*\d{1,3}(?:[.)\-]\s*|\s+)/;
const trimSep = (s: string) => s.replace(/^[,\-–\s]+/, "").replace(/[,\-–\s]+$/, "").trim();

/**
 * accepts "Name, 080…", "Name - 080…", or "Name 080…" one per line, with an
 * optional trailing location: "Name, 080…, New Hostel". Also tolerates the two
 * things callers keep pasting: a leading list number ("12. Name 080…") and the
 * number before the name ("12. 080… Name"). The phone is located first so a
 * spaced number is never mistaken for a serial or split.
 */
function parseLines(text: string): ParsedRow[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const pm = line.match(PHONE_RE);
      if (!pm) return { name: line, phone: "", location: "", valid: false, reason: "no phone found" };
      const phone = pm[0].replace(/\s/g, "").replace(/^\+?234/, "0");

      // Text before the phone is the name (drop any leading list index); text
      // after is the location. If nothing usable precedes the phone, the caller
      // wrote "index phone Name" — recover the name from after the number.
      let name = trimSep(line.slice(0, pm.index).replace(SERIAL_RE, ""));
      let location = trimSep(line.slice(pm.index! + pm[0].length));
      if (name.length < 2 && location) {
        name = location.replace(SERIAL_RE, "").trim();
        location = "";
      }
      location = location.slice(0, 80);

      if (name.length < 2)
        return { name, phone, location, valid: false, reason: "name missing" };
      if (!/^0\d{10}$/.test(phone))
        return { name, phone, location, valid: false, reason: "phone must be 11 digits" };
      return { name, phone, location, valid: true };
    });
}

export function AddContactsForm({ tree }: { tree: GroupNode[] }) {
  const [teamId, setTeamId] = useState<string>("");
  const [seniorId, setSeniorId] = useState<string>("");
  const [cellId, setCellId] = useState<string>("");
  const [broughtBy, setBroughtBy] = useState("");
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SaveContactsResult | null>(null);

  const team = tree.find((t) => t._id === teamId);
  const senior = team?.children.find((s) => s._id === seniorId);
  const rows = useMemo(() => parseLines(text), [text]);
  const valid = rows.filter((r) => r.valid);

  // Auto-select the only cell when a senior cell has exactly one — no dead-end
  // where the user must pick from a list of one to enable Save.
  useEffect(() => {
    if (senior && senior.children.length === 1 && !cellId) {
      setCellId(senior.children[0]._id);
    }
  }, [senior, cellId]);

  // the group that gets credit: deepest level selected
  const targetGroup = senior?.children.find((c) => c._id === cellId) ?? senior ?? team;
  const ready =
    valid.length > 0 &&
    !!targetGroup &&
    targetGroup.children.length === 0 &&
    broughtBy.trim().length > 1;

  // When the deepest picked group still nests deeper, Save stays disabled — tell
  // the user which level is missing instead of leaving them stuck.
  const needsPick =
    targetGroup && targetGroup.children.length > 0
      ? targetGroup === team
        ? "Pick a senior cell"
        : "Pick a cell"
      : null;

  function handleSave() {
    if (!ready || !targetGroup) return;
    setResult(null);
    startTransition(async () => {
      const res = await saveContacts({
        groupId: targetGroup._id,
        broughtBy: broughtBy.trim(),
        contacts: valid.map((r) => ({
          name: r.name,
          phone: r.phone,
          location: r.location || undefined,
        })),
      });
      setResult(res);
      if (res.ok) setText("");
    });
  }

  return (
    <div className="space-y-5">
      <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-base font-bold">Where is this list from?</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Credit goes to the cell that brought the contacts
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Select
            value={teamId}
            onValueChange={(v) => {
              setTeamId(v);
              setSeniorId("");
              setCellId("");
            }}
          >
            <SelectTrigger className="w-[160px] rounded-full">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              {tree.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {team && team.children.length > 0 && (
            <Select
              value={seniorId}
              onValueChange={(v) => {
                setSeniorId(v);
                setCellId("");
              }}
            >
              <SelectTrigger className="w-[170px] rounded-full">
                <SelectValue placeholder="Senior cell" />
              </SelectTrigger>
              <SelectContent>
                {team.children.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {senior && senior.children.length > 0 && (
            <Select value={cellId} onValueChange={setCellId}>
              <SelectTrigger className="w-[160px] rounded-full">
                <SelectValue placeholder="Cell" />
              </SelectTrigger>
              <SelectContent>
                {senior.children.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <input
            value={broughtBy}
            onChange={(e) => setBroughtBy(e.target.value)}
            placeholder="Brought by (rep's name)"
            className="bg-secondary placeholder:text-muted-foreground focus:ring-ring h-9 w-full rounded-full px-4 text-sm font-medium outline-none focus:ring-2 sm:w-56"
          />
        </div>
      </div>

      <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-base font-bold">Paste the list</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            One person per line — “Name, 080XXXXXXXX”, with an optional location:
            “Name, 080XXXXXXXX, New Hostel”. Straight from WhatsApp works.
          </p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={"Chinedu Okafor, 08031234567, New Hostel\nAmara Eze - 08087654321"}
          className="bg-secondary placeholder:text-muted-foreground/60 focus:ring-ring w-full resize-y rounded-2xl p-4 font-mono text-sm outline-none focus:ring-2"
        />

        {rows.length > 0 && (
          <ul className="max-h-56 space-y-1.5 overflow-y-auto">
            {rows.map((r, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                {r.valid ? (
                  <Icon name="success" className="size-4 shrink-0 text-[var(--team-2)]" />
                ) : (
                  <Icon name="error" className="text-destructive size-4 shrink-0" />
                )}
                <span className="font-medium">{r.name || "—"}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {r.phone || ""}
                </span>
                {r.location && (
                  <span className="text-muted-foreground/80 inline-flex items-center gap-1 text-xs">
                    <Icon name="pin" className="size-3 shrink-0" />
                    {r.location}
                  </span>
                )}
                {!r.valid && (
                  <span className="text-destructive ml-auto text-xs">{r.reason}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs font-medium">
            {valid.length} valid · {rows.length - valid.length} need fixing
            {targetGroup && targetGroup.children.length === 0 && (
              <> → credited to <b>{targetGroup.name}</b></>
            )}
            {needsPick && (
              <span className="text-primary inline-flex items-center gap-1 font-semibold">
                {" "}
                <Icon name="teams" className="size-3.5 shrink-0" />
                {needsPick} to continue
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={!ready || pending}
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-40"
          >
            {pending && <Spinner className="size-3.5 animate-spin" />}
            {pending
              ? "Saving…"
              : `Save ${valid.length > 0 ? `${valid.length} contact${valid.length === 1 ? "" : "s"}` : "contacts"}`}
          </button>
        </div>

        {result?.ok ? (
          <p className="flex items-center gap-2 text-[11px] font-semibold text-[var(--team-2)]">
            <Icon name="success" className="size-4 shrink-0" />
            Saved {result.saved} contact{result.saved === 1 ? "" : "s"}
            {result.skipped > 0 && <> · {result.skipped} skipped (duplicate/invalid)</>}
          </p>
        ) : result?.error ? (
          <p className="text-destructive flex items-center gap-2 text-[11px] font-semibold">
            <Icon name="error" className="size-4 shrink-0" />
            {result.error}
          </p>
        ) : (
          <p className="text-muted-foreground text-[11px]">
            Persistence lands with the e-register outreach API — the flow is wired.
          </p>
        )}
      </div>
    </div>
  );
}
