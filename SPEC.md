# Cell Ministry System — Specification

**Status:** draft for review · **Owner:** Jadon · **Supersedes:** the CallCenter outreach model this repo was forked from

---

## 1. What this system is

A growth-tracking system for cell ministry: it holds the **structure** (who reports to whom, all the way from Zone down to an individual member) and the **people** (members, new members, invitees, and the executives who lead them), and it measures whether cells are actually growing.

It is **not** an attendance register. That is e-register's job.

### Boundary with e-register

| | e-register | cellministrysystem |
|---|---|---|
| Service attendance | **owns** | reads |
| Programme attendance (invitees) | **owns** | reads |
| Org hierarchy (Zone → … → Cell) | consumes | **owns** |
| Members, new members, invitees | — | **owns** |
| Executive roles (CL, ACL, BST, CS, CFC) | — | **owns** |
| Cell meeting records | — | **owns** |
| Promotion eligibility + history | — | **owns** |

Two separate databases. The join key between them is **phone number**, because that is what e-register already keys programme attendance on.

---

## 2. The hierarchy

### 2.1 The problem with what exists today

The forked code has a fixed three-value enum:

```ts
type GroupLevel = "TEAM" | "SENIOR_CELL" | "CELL";
```

Three levels, hardcoded, built top-down. This blocks every requirement:

- It cannot express Zone, Group, Chapter, or PCF.
- It cannot skip an optional level (Team).
- It cannot let a Cell exist without a Senior Cell above it.
- It cannot promote a Cell into a Senior Cell.
- It cannot be deployed to a different zone whose chain of levels differs.

### 2.2 The model

**Levels are data, not code.** A deployment defines its own chain:

```ts
interface Level {
  id: string;
  name: string;       // "Zone", "PCF", "Senior Cell", "Cell"
  rank: number;       // 0 = highest (Zone). Larger = further down.
  optional: boolean;  // true → may be skipped entirely (e.g. Team)
}
```

Default seed chain for this deployment:

| rank | name | optional |
|---|---|---|
| 0 | Zone | no |
| 1 | Group | no |
| 2 | Chapter | no |
| 3 | **PCF** — Pastoral Care Fellowship | no |
| 4 | Team | **yes** |
| 5 | Senior Cell | **yes** |
| 6 | Cell | no |

> **On the missing name in Refactors.md:** the slot between Chapter and Team is **PCF (Pastoral Care Fellowship)** — the standard Loveworld structure. But it is seeded data, so another zone can rename or remove it without a code change. That is the point of the levels table.

**Every unit is the same shape.** A Zone and a Cell differ only in level rank.

```ts
interface Unit {
  id: string;
  name: string;
  levelId: string;
  parentId: string | null;   // null only for the root (Zone)
  createdAt: string;
  promotedAt: string | null; // set when this unit was promoted to its current level
  archivedAt: string | null;
}
```

### 2.3 Rules

1. **A unit's parent may be any unit of strictly higher rank** — not necessarily rank − 1. This is what makes optional levels work with no special-casing: a Cell whose parent is the PCF directly is valid, because 6 > 3.
2. **Built ground-up.** Creating a Cell requires only a name and a parent that exists. No Senior Cell is invented for it.
3. **Promotion is a first-class operation, and it is recorded.** Promoting a Cell to a Senior Cell is:
   - raise the unit's `levelId` to the target level,
   - stamp `promotedAt`,
   - re-parent the chosen units beneath it,
   - append a `UnitPromotion` history row.

   `promotedAt` is not bookkeeping — **multiplication events are the headline growth metric**. A chart of promotions over time is the clearest answer to "is this zone growing?".
4. **Archive, never delete.** Removing a unit would orphan its history. `archivedAt` hides it from pickers while its past records stay valid.

### 2.4 Why this collapses six dashboards into one

A login is bound to a unit. Everything that login can see is `subtree(unit)` — that unit and everything beneath it, at any depth.

- Cell leader → their cell.
- Senior cell leader → their cells, rolled up.
- Team / PCF / Chapter / Group / Zone leader → same function, different node.
- Admin → bound to the root.

**One query, one dashboard, scoped.** Requirement 3 of Refactors.md ("another view for a senior cell leader… then teams… then chapter… then group… then zone") is not six views — it is this one rule.

The existing roll-up (`groupRollup` in `lib/data.ts`) already aggregates up an ancestry chain and survives this refactor; it just stops assuming three levels.

---

## 3. People

### 3.1 Three separate populations

These are counted separately and never merged — a cell reports all three.

| Class | What it is | Leaves this class by |
|---|---|---|
| **Invitee** | Someone a member invited; has not attended | Attending anything → New Member |
| **New Member** | First-timer / attending, not yet established | Attending service **more than 3 times** → Member |
| **Member** | Established; may hold executive roles | — |

```ts
type PersonClass = "invitee" | "new_member" | "member";

interface Person {
  id: string;
  name: string;
  phone: string;            // REQUIRED — the join key into e-register
  unitId: string;           // the cell they belong to
  personClass: PersonClass;
  broughtById: string | null; // the member who brought them — drives BST
  joinedAt: string;
  classChangedAt: string;
  archivedAt: string | null;
}
```

**Phone is mandatory and normalised** (`+234…` canonical form). Without it a person cannot be matched to their service attendance, and the promotion engine goes blind for them. The UI must treat a missing phone as an error, not a warning.

### 3.2 Executives are roles, not a fourth class

An executive is a **Member holding a role**. One member may hold several.

```ts
type ExecRole = "CL" | "ACL" | "BST" | "CS" | "CFC";
```

| Role | Full name | Assigned |
|---|---|---|
| CL | Cell Leader | by hierarchy |
| ACL | Assistant Cell Leader | by hierarchy |
| **BST** | Bible Study Teacher | **earned — see below** |
| CS | Cell Secretary | by hierarchy |
| CFC | Cell Follow-up Coordinator | by hierarchy |

**BST is earned, not granted.** Per Refactors.md: a member who has brought **three people who have themselves been promoted from new member to member**. This is computed from the `broughtById` chain — count that member's referrals currently at `personClass: "member"`. When it reaches 3, they become eligible.

A cell's roster therefore reports: **total members + executives + new members + invitees**, as three countable classes with roles layered on the member class.

---

## 4. Promotion: automatic detection, human confirmation

> *"the promotion happens automatically but the cell leader needs to be aware before confirmation — kind of, he is ready to be promoted"*

Nothing is ever silently reclassified. The engine **detects**; the leader **confirms**.

### 4.1 Flow

```
 nightly job + on-demand recompute
              │
              ▼
   evaluate eligibility rules
              │
              ▼
   ┌──────────────────────┐
   │  Ready for promotion │  ← queue on the cell leader's dashboard
   └──────────────────────┘
        │            │
     confirm       dismiss
        │            │
        ▼            ▼
   promoted,    stays, re-surfaces
   recorded     next cycle
```

### 4.2 Rules evaluated

| Promotion | Rule | Data source |
|---|---|---|
| Invitee → New Member | attended anything at least once | e-register |
| New Member → Member | attended service **> 3 times** | e-register |
| Member → BST | 3 referrals now at Member class | this system |
| Cell → Senior Cell | leader-initiated, admin-approved | this system |

### 4.3 Every promotion is auditable

```ts
interface Promotion {
  id: string;
  subjectType: "person" | "unit";
  subjectId: string;
  from: string;
  to: string;
  detectedAt: string;
  confirmedAt: string | null;
  confirmedBy: string | null;  // which login confirmed
  dismissedAt: string | null;
  evidence: Record<string, unknown>; // e.g. { serviceCount: 5 } or { referrals: [...] }
}
```

`evidence` matters: when a leader asks *"why is this person eligible?"*, the UI answers with the actual count, not a shrug.

---

## 5. Attendance — the recommendation, and why

**Recommendation: read e-register's attendance API. Do not duplicate service attendance here.**

Reasoning:

1. **The rule you wrote is about service attendance.** "Attended service above three times" is not cell-meeting attendance. Only e-register knows it. Logging it here would mean answering the question with the wrong data.
2. **Duplication guarantees disagreement.** If leaders mark attendance in both systems, the two numbers will diverge within weeks, and neither will be trusted. Whichever system the leader touches last wins — which is not a rule anyone can reason about.
3. **The join already exists.** e-register keys programme attendance by phone. Matching is a lookup, not an integration project.

**But the two systems track different attendance, and both are needed:**

| Attendance | Owner | Drives |
|---|---|---|
| **Service** (Sunday, midweek, programmes) | e-register | promotion eligibility |
| **Cell meeting** (weekly cell gathering) | cellministrysystem | growth metrics, leader accountability |

These are not the same event and neither replaces the other. Cell meeting attendance is logged here because e-register does not model cell meetings at all.

**Weak-network mitigation:** eligibility is computed by a scheduled job that snapshots service counts into this database, not by a live call during page render. The dashboard reads the snapshot. A stalled e-register never blocks a leader's page — it only means the queue is a day stale, which is fine for a rule measured in weeks.

**Required from e-register:** one new read endpoint — service attendance counts by phone, over a date range.

---

## 6. Auth and scoping

Extends the existing JWT session (`lib/auth.ts`), which already carries a discriminated role and is Edge-safe for the proxy.

```ts
type Session =
  | { role: "admin" }                                  // bound to root
  | { role: "leader"; personId: string; unitId: string; name: string };
```

The current `CallerSession.seniorCellId` becomes `unitId` — generalised from "which senior cell" to "which node of the tree", at any depth. **This is requirement 1 of Refactors.md** ("callers notation should be changed to cell"): a caller was already a scoped login; it becomes a unit-scoped leader login, and the scoping rule stops being senior-cell-specific.

Authorisation is one predicate: **can this session's unit reach that unit by descending the tree?**

---

## 7. What carries over from CallCenter

**Keep** — this is why we forked rather than started fresh:

- Ancestry / roll-up aggregation (`groupRollup`, `ancestryMap`) — the monitoring spine
- JWT session gate, admin code stored hashed and changeable from settings
- Whole shell: sidebar, bottom nav, page skeletons, loading boundaries
- Charts, stat cards, leaderboard, team colours, Solar duotone icon set
- Weak-network hardening: cached reads, timeouts, background revalidation, optimistic writes
- The `broughtBy` referral concept — repurposed to drive BST

**Drop** — outreach-only:

- Contacts, call logs, call outcomes (answered / no answer / messaged)
- Caller PIN gate and caller bar
- Follow-ups queue, SMS broadcast composer, collation report
- Campaign-window model (event + target + N-day countdown)

**Add:**

- Levels registry and generic Unit tree, with create / promote / re-parent
- Person model with three classes, executive roles, referral chain
- Promotion engine: detection, queue, confirmation, audit trail
- Cell meeting records
- Growth analytics: attendance trend, new members added, retention, multiplication events
- Own database + data access layer

---

## 8. Migration

1. Seed the levels table with the seven-level chain above.
2. Import e-register's existing groups once: `TEAM` → Team, `SENIOR_CELL` → Senior Cell, `CELL` → Cell.
3. Create the Zone / Group / Chapter / PCF units above them and re-parent the imported Teams.
4. From then on, **cellministrysystem is the source of truth for structure.** e-register reads from here rather than keeping its own copy — otherwise the two trees drift, and promotions make the drift worse.

---

## 9. Open questions

1. **Which zone/group/chapter is this deployment?** Needed to seed the root units.
2. **Can a person belong to more than one cell?** Assumed no.
3. **When a cell is promoted to senior cell, do its members move to a new child cell, or stay?** Assumed a new child cell is created and members move down.
4. **"Attended service above three times" — ever, or within a window?** Assumed ever, all-time.
5. **Does a leader log in with a PIN (as callers did) or a password?** PIN is lower friction on a phone; a password is safer for someone who can see a whole chapter.
