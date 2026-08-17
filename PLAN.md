# Build Plan

Companion to [SPEC.md](./SPEC.md). Phases are ordered by dependency — each one leaves the app building and usable.

---

## Phase 0 — Foundations

- [ ] Choose and provision the database (MongoDB, to match e-register's stack and the ObjectId shapes already assumed in the code)
- [ ] Data access layer + connection pooling suited to serverless
- [ ] **Tenant scoping enforced in the data layer** — every query filtered by tenant, not per-call-site
- [ ] Seed the levels table with the seven-level chain (Zone → Group → Chapter → PCF → Team* → Senior Cell* → Cell)
- [ ] Environment variables and Vercel project (KayProject account — note the dead `binary` decoy under jadonamites-projects)

## Phase 0b — Signup and seeding

- [ ] Admin signup: creates the tenant and its root units
- [ ] Structure setup wizard — admin names their Zone / Group / Chapter, then builds downward
- [ ] Seed the first tenant this way: **Zone G → Group A → FUTA Chapter**
- [ ] Leader invitation flow

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

- [ ] `Session` becomes `{ role: "admin", tenantId } | { role: "leader", tenantId, personId, unitId, name }`
- [ ] `subtree(unitId)` + the "can this session reach that unit" predicate
- [ ] Retire the caller PIN gate and caller bar; leader login replaces them
- [ ] **Credential by level rank:** PIN for cell leaders (reuse the scrypt-hashed caller PIN path), password for senior cell and above
- [ ] Promotion forces a password set on next sign-in when a cell becomes a senior cell
- [ ] Password reset flow; admin-initiated PIN reset
- [ ] Apply scoping to every page — one dashboard, scoped by the session's unit
- [ ] Verify a cell leader cannot read a sibling cell (test this explicitly, it is the whole security model)

## Phase 3 — People

- [ ] `Person` model: three classes, `broughtById` referral pointer, mandatory normalised phone
- [ ] Phone normalisation + duplicate detection on entry
- [ ] Executive roles (CL, ACL, BST, CS, CFC) as assignments on members
- [ ] Cell roster view: total members + executives + new members + invitees, counted separately
- [ ] Add / edit / archive people; bulk add (reuse CallCenter's hardened paste parser)

## Phase 4 — The promotion engine

*Read-only against e-register. This system never captures attendance — see SPEC §5.*

- [ ] **New endpoint in e-register:** service attendance counts by phone over a date range
- [ ] Snapshot job pulling those counts into this DB (scheduled, not on render)
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

## Phase 6 — UI refactor

*Apple aesthetic, lavender purple, glossy. See SPEC §9.*
*Blocked: awaiting a reference image from Jadon for the background / theme.*

- [ ] Replace the palette: single lavender-purple accent, white text, retire the royal-blue / violet / teal / amber team colours
- [ ] Surface system: glossy buttons and modals built from soft shadow, subtle gradient, light top edge
- [ ] Rebuild the shell — sidebar, bottom nav, headers — on generous space rather than borders and nested cards
- [ ] Overview screens reduced to a few large, calm numbers; detail moved one tap deeper into modals
- [ ] Recharts restyled to the single-accent system
- [ ] Motion pass: transitions that explain origin, nothing decorative
- [ ] Typography scale — hierarchy by weight and size, not colour

## Phase 7 — Cleanup

- [ ] Delete outreach remnants: contacts, logs, outcomes, follow-ups, SMS composer, collation report, campaign windows
- [ ] Rewrite `README.md`, `CLAUDE.md`, `AGENTS.md` for this system
- [ ] Rename lingering `CALLCENTER_*` env vars and the `cc_session` cookie

---

## Blocking on you

1. **A reference image for the background / theme** — blocks Phase 6 only. Phases 0–5 are unblocked.

The rest proceeds on the assumptions recorded in SPEC.md §10.
