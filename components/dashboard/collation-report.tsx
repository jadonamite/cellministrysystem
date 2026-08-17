"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { Icon, Spinner } from "@/components/icons";
import { TeamDonut, type TeamSlice } from "@/components/dashboard/team-donut";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import type { GroupStats, OutcomeSlice } from "@/lib/data";

type Kind = "collation" | "standings";

type Ctx = { busy: Kind | null; download: (k: Kind) => void };
const CollationReportContext = createContext<Ctx | null>(null);

function useReport(): Ctx {
  const ctx = useContext(CollationReportContext);
  if (!ctx) throw new Error("CollationDownloadButton must be inside CollationReportProvider");
  return ctx;
}

/**
 * Owns the two off-screen report nodes and the capture logic; exposes
 * `download(kind)` to the buttons placed under each dashboard section. The
 * reports render off-screen so they capture at a fixed, clean width regardless
 * of the viewport, and at 2× scale so the downloaded PNG isn't tiny.
 */
export function CollationReportProvider({
  eventName,
  dateLabel,
  teams,
  outcomes,
  rollup,
  teamColorOf,
  children,
}: {
  eventName: string;
  dateLabel: string;
  teams: TeamSlice[];
  outcomes: OutcomeSlice[];
  rollup: GroupStats[];
  teamColorOf: Record<string, string>;
  children: ReactNode;
}) {
  const collationRef = useRef<HTMLDivElement>(null);
  const standingsRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<Kind | null>(null);

  const slug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  async function download(kind: Kind) {
    const node = kind === "collation" ? collationRef.current : standingsRef.current;
    if (!node || busy) return;
    setBusy(kind);
    try {
      const { toPng } = await import("html-to-image");
      const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
      // Render the node at 2× so the exported PNG reads big, not tiny.
      const scale = 2;
      const dataUrl = await toPng(node, {
        backgroundColor: bg,
        pixelRatio: 2,
        width: node.offsetWidth * scale,
        height: node.offsetHeight * scale,
        style: { transform: `scale(${scale})`, transformOrigin: "top left" },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${slug}-${kind}.png`;
      a.click();
    } catch {
      // Silent — the button re-enables so the caller can retry.
    } finally {
      setBusy(null);
    }
  }

  return (
    <CollationReportContext.Provider value={{ busy, download }}>
      {children}

      {/* Off-screen capture targets — laid out (not display:none) so recharts sizes. */}
      <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden>
        {/* Collation — standalone, big and bold. */}
        <div ref={collationRef} className="bg-background w-[560px] space-y-5 p-8">
          <div>
            <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Collation report
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight">{eventName}</h2>
            <p className="text-muted-foreground text-sm">Collation by team · {dateLabel}</p>
          </div>
          <TeamDonut teams={teams} outcomes={outcomes} large />
        </div>

        {/* Standings — teams + senior cells, cells collapsed. */}
        <div ref={standingsRef} className="bg-background w-[940px] space-y-5 p-8">
          <div>
            <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
              Team standings
            </p>
            <h2 className="text-2xl font-bold">{eventName}</h2>
            <p className="text-muted-foreground text-sm">{dateLabel}</p>
          </div>
          <Leaderboard
            rows={rollup}
            teamColorOf={teamColorOf}
            readOnly
            subtitle="Contacts collated per team, rolled up through senior cells"
          />
        </div>
      </div>
    </CollationReportContext.Provider>
  );
}

/** The download trigger for one report — place under its dashboard section. */
export function CollationDownloadButton({ kind, label }: { kind: Kind; label: string }) {
  const { busy, download } = useReport();
  return (
    <button
      type="button"
      onClick={() => download(kind)}
      disabled={busy !== null}
      className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
    >
      {busy === kind ? (
        <Spinner className="size-3.5 animate-spin" />
      ) : (
        <Icon name="download" className="size-3.5" />
      )}
      {busy === kind ? "Preparing…" : label}
    </button>
  );
}
