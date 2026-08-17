"use client";

import { useMemo, useState, useTransition } from "react";
import { Icon, Spinner } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SMS_PROVIDERS,
  providerMeta,
  smsPages,
  fillTemplate,
  isSendable,
  type SmsProviderId,
  type SmsRoute,
} from "@/lib/sms";
import { sendBroadcast } from "@/app/messages/actions";

interface Recipient {
  id: string;
  name: string;
  phone: string;
  cell: string;
  teamId: string;
  outcome: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Everyone" },
  { value: "not_contacted", label: "Not yet contacted" },
  { value: "no_answer", label: "No answer" },
  { value: "messaged_only", label: "Messaged only" },
  { value: "answered", label: "Answered" },
];

const DEFAULT_TEMPLATE =
  "Hi {name}! You're warmly invited to {event} this Sunday at LWC. It'll be a powerful time — I'd love to see you there. 🙏";

export function BroadcastComposer({
  recipients,
  teams,
  eventName,
  initialTemplate,
}: {
  recipients: Recipient[];
  teams: { id: string; name: string }[];
  eventName: string;
  /** invite template from Settings; falls back to the built-in SMS default */
  initialTemplate?: string;
}) {
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState(initialTemplate || DEFAULT_TEMPLATE);
  const [provider, setProvider] = useState<SmsProviderId>("termii");
  const [route, setRoute] = useState<SmsRoute>("dnd");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const candidates = useMemo(
    () =>
      recipients.filter(
        (r) =>
          isSendable(r.phone) &&
          (teamFilter === "all" || r.teamId === teamFilter) &&
          (statusFilter === "all" || r.outcome === statusFilter)
      ),
    [recipients, teamFilter, statusFilter]
  );

  const selected = useMemo(
    () => candidates.filter((r) => !excluded.has(r.id)),
    [candidates, excluded]
  );

  const meta = providerMeta(provider);
  const pages = smsPages(fillTemplate(template, { name: "Xxxxxxx", event: eventName, cell: "Xxxxx" }));
  const cost = selected.length * pages * meta.perSms;
  const preview = selected[0]
    ? fillTemplate(template, { name: selected[0].name, event: eventName, cell: selected[0].cell })
    : fillTemplate(template, { name: "Chinedu", event: eventName, cell: "Peculiar" });

  function toggleExcluded(id: string) {
    setExcluded((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function send() {
    setResult(null);
    startTransition(async () => {
      const res = await sendBroadcast({
        provider,
        route,
        template,
        eventName,
        recipients: selected.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          cell: r.cell,
        })),
      });
      if (res.ok) {
        setResult({
          ok: true,
          text: `Queued ${res.queued} message${res.queued === 1 ? "" : "s"} via ${meta.label}${
            res.skipped ? ` · ${res.skipped} skipped` : ""
          }.`,
        });
      } else {
        setResult({ ok: false, text: res.error ?? "Could not send." });
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* audience */}
      <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-base font-bold">Who gets this?</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Filter the audience, then uncheck anyone you want to skip
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[170px] rounded-full">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[190px] rounded-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm font-semibold">
          <span className="text-primary tabular-nums">{selected.length.toLocaleString()}</span>{" "}
          <span className="text-muted-foreground font-medium">
            of {candidates.length.toLocaleString()} sendable selected
          </span>
        </p>

        {candidates.length > 0 && (
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {candidates.slice(0, 300).map((r) => (
              <label
                key={r.id}
                className="hover:bg-secondary/50 flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={!excluded.has(r.id)}
                  onChange={() => toggleExcluded(r.id)}
                  className="accent-primary size-4"
                />
                <span className="font-medium">{r.name}</span>
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {r.phone}
                </span>
                <span className="text-muted-foreground/70 ml-auto text-xs">{r.cell}</span>
              </label>
            ))}
            {candidates.length > 300 && (
              <p className="text-muted-foreground px-2 py-1 text-xs">
                +{(candidates.length - 300).toLocaleString()} more in this filter…
              </p>
            )}
          </div>
        )}
      </div>

      {/* compose */}
      <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-base font-bold">Message</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Tokens fill in per person:{" "}
            <code className="bg-secondary rounded px-1 py-0.5">{"{name}"}</code>{" "}
            <code className="bg-secondary rounded px-1 py-0.5">{"{event}"}</code>{" "}
            <code className="bg-secondary rounded px-1 py-0.5">{"{cell}"}</code>
          </p>
        </div>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={4}
          className="bg-secondary placeholder:text-muted-foreground/60 focus:ring-ring w-full resize-y rounded-2xl p-4 text-sm outline-none focus:ring-2"
        />
        <div className="text-muted-foreground flex flex-wrap justify-between gap-2 text-xs">
          <span>{template.length} chars · {pages} SMS page{pages === 1 ? "" : "s"} each</span>
        </div>
        <div className="bg-secondary/50 rounded-2xl p-3.5 text-sm">
          <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-widest uppercase">
            Preview
          </p>
          {preview}
        </div>
      </div>

      {/* send */}
      <div className="card-soft bg-card space-y-4 rounded-3xl p-5 sm:p-6">
        <div>
          <h2 className="text-base font-bold">Delivery</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {SMS_PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProvider(p.id)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                provider === p.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {p.label} · ₦{p.perSms}/sms
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">{meta.note}</p>

        <div className="flex flex-wrap gap-2">
          {(["dnd", "generic"] as SmsRoute[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoute(r)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                route === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {r === "dnd" ? "DND route (reaches all)" : "Generic route (cheaper)"}
            </button>
          ))}
        </div>

        {route === "generic" ? (
          <p className="flex items-start gap-2 text-xs font-medium text-[var(--team-5)]">
            <Icon name="warning" className="mt-0.5 size-4 shrink-0" />
            Generic route won&apos;t deliver to numbers on DND (most personal lines) and
            can&apos;t send to MTN 8PM–8AM. Fine for tests only.
          </p>
        ) : (
          <p className="flex items-start gap-2 text-xs font-medium text-[var(--team-5)]">
            <Icon name="warning" className="mt-0.5 size-4 shrink-0" />
            DND route needs a registered alphanumeric Sender ID (church name) approved
            with {meta.label} before real sends.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <p className="text-sm font-semibold">
            Est. cost{" "}
            <span className="text-primary tabular-nums">
              ₦{cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>{" "}
            <span className="text-muted-foreground font-medium">
              · {selected.length.toLocaleString()} recipients
            </span>
          </p>
          <button
            type="button"
            onClick={send}
            disabled={pending || selected.length === 0 || template.trim().length < 5}
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold disabled:opacity-40"
          >
            {pending ? <Spinner className="size-3.5 animate-spin" /> : <Icon name="send" className="size-3.5" />}
            {pending ? "Sending…" : `Send to ${selected.length.toLocaleString()}`}
          </button>
        </div>

        {result && (
          <p
            className={`flex items-center gap-2 text-xs font-semibold ${
              result.ok ? "text-[var(--team-2)]" : "text-destructive"
            }`}
          >
            {result.ok ? <Icon name="success" className="size-4" /> : <Icon name="error" className="size-4" />}
            {result.text}
          </p>
        )}
        <p className="text-muted-foreground text-[11px]">
          Wired end-to-end — live sending starts once a {meta.label} account + Sender ID are set.
        </p>
      </div>
    </div>
  );
}
