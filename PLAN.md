# Build Plan

Companion to [SPEC.md](./SPEC.md). Phases are ordered by dependency — each one leaves the app building and usable.

---

## Phase 0 — Foundations

- [ ] Choose and provision the database (MongoDB, to match e-register's stack and the ObjectId shapes already assumed in the code)
- [ ] Data access layer + connection pooling suited to serverless
- [ ] Seed the levels table with the seven-level chain (Zone → Group → Chapter → PCF → Team* → Senior Cell* → Cell)
- [ ] Environment variables and Vercel project (KayProject account — note the dead `binary` decoy under jadonamites-projects)

## Phase 1 — The tree

*Everything else depends on this. Do it first and completely.*

- [ ] Replace `GroupLevel` enum with the `Level` + `Unit` types in `lib/types.ts`
- [ ] Rewrite `lib/groups.ts`: read units from own DB, build arbitrary-depth tree, keep `ancestryMap` / `leafNodes` working
- [ ] Generalise `groupRollup` in `lib/data.ts` off the three-level assumption
- [ ] Unit CRUD: create (ground-up, parent = any higher rank), rename, archive
- [ ] Re-parent operation
- [ ] Promote operation: raise level, stamp `promotedAt`, re-parent children, write history row
- [ ] Migration script: import e-register's 19 groups, create Zone/Group/Chapter/PCF above them
- [ ] Tree management UI (admin)

## Phase 2 — Scoped access

- [ ] `Session` becomes `{ role: "admin" } | { role: "leader", personId, unitId, name }`
- [ ] `subtree(unitId)` + the "can this session reach that unit" predicate
- [ ] Retire the caller PIN gate and caller bar; leader login replaces them
- [ ] Apply scoping to every page — one dashboard, scoped by the session's unit
- [ ] Verify a cell leader cannot read a sibling cell (test this explicitly, it is the whole security model)

## Phase 3 — People

- [ ] `Person` model: three classes, `broughtById` referral pointer, mandatory normalised phone
- [ ] Phone normalisation + duplicate detection on entry
- [ ] Executive roles (CL, ACL, BST, CS, CFC) as assignments on members
- [ ] Cell roster view: total members + executives + new members + invitees, counted separately
- [ ] Add / edit / archive people; bulk add (reuse CallCenter's hardened paste parser)

## Phase 4 — Attendance and the promotion engine

- [ ] **New endpoint in e-register:** service attendance counts by phone over a date range
- [ ] Snapshot job pulling those counts into this DB (scheduled, not on render)
- [ ] Cell meeting records: date, attendance, first-timers, offering, testimonies
- [ ] Eligibility rules: invitee → new member, new member → member (>3 services), member → BST (3 referrals at member)
- [ ] "Ready for promotion" queue on the leader dashboard, with the evidence behind each
- [ ] Confirm / dismiss, writing the full `Promotion` audit row
- [ ] Dismissed items re-surface next cycle

## Phase 5 — Growth analytics

- [ ] Attendance trend per cell, rolled up the tree
- [ ] New members added over time
- [ ] Retention: do first-timers come back?
- [ ] Multiplication timeline from `promotedAt` — the headline metric
- [ ] Leaderboard reworked from call volume to growth
- [ ] Reports rolled up the hierarchy

## Phase 6 — Cleanup

- [ ] Delete outreach remnants: contacts, logs, outcomes, follow-ups, SMS composer, collation report, campaign windows
- [ ] Rewrite `README.md`, `CLAUDE.md`, `AGENTS.md` for this system
- [ ] Rename lingering `CALLCENTER_*` env vars and the `cc_session` cookie

---

## Blocking on you

Answers needed before Phase 0 and Phase 1 respectively — the rest can proceed on the assumptions recorded in SPEC.md §9.

1. **Which Zone / Group / Chapter is this deployment?** — needed to seed the root units.
2. **Leader login: PIN or password?** — PIN is lower friction on a phone; a password is safer for a login that can see a whole chapter.
