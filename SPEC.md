# Cell Ministry System — Specification

**Status:** draft for review · **Owner:** Jadon · **Supersedes:** the CallCenter outreach model this repo was forked from

---

## 1. What this system is

**A monitoring and tracking system.** It answers *"is this cell growing, and who is ready to move up?"* — it does not capture attendance.

It holds the **structure** (who reports to whom, from Zone down to an individual member) and the **people** (members, new members, invitees, and the executives who lead them), and it measures movement through both.

> **It never takes attendance.** No register, no marking people present, no roll call. Attendance is captured in e-register and read from there. If a screen in this system asks a leader to mark who showed up, that screen is wrong.

What a leader actually *does* here: maintain their roster, confirm promotions, and watch their cell's trend. Everything else is read-only monitoring.

### Boundary with e-register

| | e-register | cellministrysystem |
|---|---|---|
| Capturing attendance (services, programmes) | **owns** | never |
| Org hierarchy (Zone → … → Cell) | consumes | **owns** |
| Members, new members, invitees | — | **owns** |
| Executive roles (CL, ACL, BST, CS, CFC) | — | **owns** |
| Promotion eligibility + history | — | **owns** |
| Growth metrics and roll-ups | — | **owns** |

Two separate databases. The join key between them is **phone number**, because that is what e-register already keys programme attendance on.

---

## 1a. Tenancy

**Every zone is a tenant and seeds its own structure.** Nothing about a specific zone is hardcoded — an admin signs up, names their Zone / Group / Chapter, and the tree grows from there. That is what makes the system deployable elsewhere without a rewrite, alongside the data-driven levels of §2.

```ts
interface Tenant {
  id: string;
  name: string;
  rootUnitId: string;   // the Zone
  createdAt: string;
}
```

Every `Unit`, `Person`, and `Promotion` carries a `tenantId`. Every query is filtered by the session's tenant — no exceptions. Cross-tenant reads are the one bug class that would be unrecoverable, so tenant scoping belongs in the data access layer, not in individual queries.

**Working data for now:** `Zone G → Group A → FUTA Chapter`. Seeded through the normal signup path, not as a special case — we are the first tenant, not a hardcoded one.

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

## 5. Attendance — read only, always

This system **reads** attendance and **never captures** it. e-register is the register; this is the monitor.

Reasoning:

1. **The rule is about service attendance.** "Attended service above three times" is something only e-register knows. Capturing a parallel number here would answer the question with the wrong data.
2. **Duplication guarantees disagreement.** Two attendance figures for the same people diverge within weeks and neither gets trusted — whichever system was touched last wins, which is not a rule anyone can reason about.
3. **The join already exists.** e-register keys programme attendance by phone. Matching is a lookup, not an integration project.

**Weak-network mitigation:** eligibility is computed by a scheduled job that snapshots service counts into this database, not by a live call during page render. The dashboard reads the snapshot. A stalled e-register never blocks a leader's page — it only means the queue is a day stale, which is fine for a rule measured in weeks.

**Required from e-register:** one new read endpoint — service attendance counts by phone, over a date range.

---

## 6. Auth and scoping

Extends the existing JWT session (`lib/auth.ts`), which already carries a discriminated role and is Edge-safe for the proxy.

```ts
type Session =
  | { role: "admin"; tenantId: string }                                  // bound to root
  | { role: "leader"; tenantId: string; personId: string; unitId: string; name: string };
```

The current `CallerSession.seniorCellId` becomes `unitId` — generalised from "which senior cell" to "which node of the tree", at any depth. **This is requirement 1 of Refactors.md** ("callers notation should be changed to cell"): a caller was already a scoped login; it becomes a unit-scoped leader login, and the scoping rule stops being senior-cell-specific.

Authorisation is one predicate: **can this session's unit reach that unit by descending the tree?** — evaluated inside the tenant.

### Credentials scale with reach

| Login binds to | Credential |
|---|---|
| A **Cell** | 4-digit PIN |
| **Senior Cell and above** (Team, PCF, Chapter, Group, Zone) | Password |

A cell leader is on a phone between meetings and sees one cell — a PIN is the right friction, and the scrypt-hashed PIN path already exists from the caller gate. A senior cell leader upward can see an entire branch, so the credential has to be worth what it unlocks. The rule is derived from the unit's level rank, not configured per person, so it stays true automatically when a cell is promoted: **promote a cell to senior cell and its leader is required to set a password on next sign-in.**

Passwords need a reset flow; PINs are reset by the admin.

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
- Growth analytics: attendance trend, new members added, retention, multiplication events
- Own database + data access layer, tenant-scoped
- Tenant signup and structure seeding

---

## 8. Migration

1. Seed the levels table with the seven-level chain above.
2. Sign up the first tenant through the normal flow, naming **Zone G → Group A → FUTA Chapter**.
3. Import e-register's existing groups once into that tenant: `TEAM` → Team, `SENIOR_CELL` → Senior Cell, `CELL` → Cell; re-parent the imported Teams under the FUTA Chapter's PCF.
4. From then on, **cellministrysystem is the source of truth for structure.** e-register reads from here rather than keeping its own copy — otherwise the two trees drift, and promotions make the drift worse.

---

## 9. Design direction

**Apple aesthetic: clean, premium, calm.** Dark, lavender purple, white text, glossy buttons and modals.

### The palette

Taken from Jadon's reference image: a deep aubergine canvas with an iridescent prismatic bloom refracting through it, white text, gold on the single most important thing.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#150C24` | Page base — deep aubergine, near-black |
| `surface` | `#211539` | Cards, panels |
| `surface-raised` | `#2E1B4D` | Modals, popovers, hover |
| `stroke` | `rgba(183,148,246,.22)` | The thin lavender edge on every glossy surface |
| `accent` | `#B794F6` | Primary lavender — buttons, active state, hierarchy |
| `accent-bright` | `#C9AAFF` | Top edge of a glossy button, focus rings |
| `gold` | `#F5C563` | Reserved for the single most important figure on a screen |
| `text` | `#FFFFFF` | Body |
| `text-muted` | `#C9BEDD` | Labels, secondary |
| Bloom hues | `#FFB86B` `#FF9ECD` `#7FE3E8` `#C77DFF` | Ambient gradient only — never on data |

### The rule that makes it work

**The iridescence is ambient. Data never sits on it.**

That gradient is what makes the reference beautiful, and it is also exactly what would destroy a dense table of two hundred cells. So it lives in one layer only — heavily blurred, low opacity, behind everything — while every surface carrying information sits on near-opaque purple glass above it. Colour bleeds around the data, never through it.

This is the whole *"a lot without feeling like a lot"* strategy in one rule: the richness is atmosphere, the content is calm.

### Gloss recipe

A glossy button or modal is four things, no ornament:
1. Fill: a subtle vertical gradient, lighter at the top
2. Edge: a 1px `accent-bright` top border at low opacity — the light catching it
3. Lift: a soft, wide, low-opacity shadow — never a hard drop shadow
4. Radius: generous, consistent, Apple-scale

The governing constraint, in Jadon's words: **"a lot without feeling like a lot."** These screens carry dense information — a zone pastor looking at hundreds of cells, a promotion queue, roll-ups at six levels. Density is the requirement; the *feeling* of density is the enemy.

How that translates:

| Principle | In practice |
|---|---|
| **Generous space** | Space does the separating. No boxes inside boxes, no borders where space will do. |
| **One accent** | Lavender carries hierarchy, state and emphasis. Gold appears once per screen, on the figure that matters most. |
| **Depth, not decoration** | Glossy surfaces get their weight from soft shadow, subtle gradient and a light top edge — not from ornament. |
| **Progressive disclosure** | The overview is a few large, calm numbers. Detail lives one tap deeper, in modals. A leader should never meet all of it at once. |
| **Motion as explanation** | Transitions show where a thing came from. Nothing bounces or decorates. |
| **Typographic hierarchy** | Weight and scale, not colour and rules, establish what matters. |

This replaces CallCenter's royal-blue / violet / teal / amber team palette wholesale. Per-team colour coding is dropped — it fights a single-accent system and is the fastest route to feeling like a lot.

---

## 10. Open questions

1. **Can a person belong to more than one cell?** Assumed no.
2. **When a cell is promoted to senior cell, do its members move to a new child cell, or stay?** Assumed a new child cell is created and members move down.
3. **"Attended service above three times" — ever, or within a window?** Assumed ever, all-time.
