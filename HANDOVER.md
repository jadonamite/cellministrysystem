# Handover

Last sessions: 30 September to 2 October 2026. Nothing has been committed yet; every change
below is in the working tree.

## Where things stand

The public landing page was rebuilt on 2 October around the ministry's own photos, a stage
blue and gold palette, scroll-driven depth (parallax), a pinned horizontal run and
skeuomorphic nav keys. Checked in a browser at 1440px and 390px, with and without reduced
motion, with no console errors. The signed-in app screens have only had their tokens and font
swapped; they now pick up the blue palette through tokens but have not been restyled.

Run it: `npm install`, then `npm run dev -- -p 3100`, then open http://localhost:3100.
Do not run `npm run build` while the dev server is running: it leaves the dev server serving
stale CSS. Stop the server, delete `.next`, and restart if that happens.

## Decisions the user has made

- **Palette (2 October): stage blue and gold**, replacing green. Midnight `#070B24`, stage
  blue `#1E40D8`, gold `#E9B949`, cream `#F6EBDE`, rare magenta `#C2187A`. Taken from the
  zone's flyers and the blue-lit auditorium. See DESIGN.md.
- **Layout (2 October), approved from an ASCII sketch:** hero in three depth planes (stage,
  statement, cut-out crowd), Join us as a pinned horizontal run, Listen in over a drifting
  photo, Live event card that tilts upright, Gallery as a curved strip following
  `design/references/gallery.jpeg`. Nav links are skeuomorphic keys on a console.
- The Get Acquainted (CEPC Akure) material is part of Zone G and may be used.
- The public site is **BLWZONEG** (BLW Campus Ministry, Zone G). "Cell Ministry" is the name
  of the signed-in app only. Do not put "Cell Ministry" on the landing page.
- Font is Google Sans Flex everywhere. Instrument Serif italic is the highlight face, one
  word or phrase per heading (`serif-highlight` utility).
- Landing order: hero, Join us, Listen in, Live event, Gallery, footer. The page fades from
  midnight at the top to cream at the bottom. The old sections (who we are, how a cell grows,
  structure) were dropped on request.
- Hero: statement centred, no subtext. The wordmark and section keys sit along the bottom
  of the hero and dock as a floating console once the hero bar scrolls away.
- Service facts confirmed by the user: Cell Meetings are on Fridays. Sunday Service is
  9:45 AM and the venue is BLW Auditorium, Plot 13 beside IBK Filling Station, FUTA
  Southgate (both from the zone's own flyers).

The user was unhappy with the first landing attempt because a verbal layout ("banner, then
the words, then the links") was built as separate sections. When a layout is described in
words, sketch the first screen back as ASCII before building.

## Still placeholder (all in `lib/site-content.ts`)

- Service times now come from the zone's "See you next service" flyer: Sundays 9:45 AM,
  first Sunday 7:45 AM, Wednesdays 6:00 PM. **Asked the user to confirm they are current; no
  answer yet.** The old "Communion Service" panel became "First Sunday" because the flyer
  does not say the 7:45 AM service is communion.
- Cell Meetings time (day is Friday; no time given). The panel says "time to be confirmed".
- LIFT event date ("Date to be announced")
- Listen in audio: `LISTEN.src` is null, so the player renders disabled with a note
- Gallery captions are the photographers' folder names (event and date). The months for
  "Sunday 16th" and "Sunday 23rd" are inferred as August from the folder dates.
- Photographer credit: not agreed. Ask before the site goes public.

Photos: `public/images/zoneg/live/` holds 30 service photos picked from about 830 in the
eight shared Drive folders, plus `hero-crowd.png`, a cut-out of the hero crowd made here by
masking. The user offered to generate assets: a cleaner hero cut-out (same 2000x1333 canvas)
is the most useful one. Flyers in `public/images/zoneg/` are still the 640px Instagram copies.
`public/images/stock/` is no longer used by any page and can be deleted once the user agrees.

## What changed in the code

- Routing: the dashboard moved from `/` to `/dashboard`. Signed-in screens live in
  `app/(app)/` with the sidebar layout; public pages live in `app/(site)/`. `proxy.ts` lets
  `/`, `/terms`, `/privacy` and `/cookies` through without a session.
- Landing components: `components/site/` (hero, section-nav, join-us, listen-in,
  live-event, gallery, flyer-button, footer, consent-banner, legal-page, cell-mark,
  motion-root). `lib/use-reduced-motion.ts` is the hydration-safe reduced-motion hook; use it
  rather than framer's `useReducedMotion` wherever markup branches on the setting.
- Gotcha: editing files with `sed -i` replaces the file, and the dev server's watcher can
  miss it. Write files in place (editor, Write tool, or Python) or the browser keeps old code.
- Legal pages, footer links and the cookie notice are in place. The cookie policy lists
  every cookie the app actually sets. None has had legal review, and each page says so.
- Tokens: `app/globals.css` (stage blue, gold, paper canvas, both themes, 44px targets,
  reduced motion and transparency, plus the `key`, `key-gold`, `key-lamp` and `console`
  utilities). `DESIGN.md` explains them.
- `components/ui/dialog.tsx`: close button enlarged to a 44px target.

## Next, once the user confirms

1. Carry the design system into the app screens: dashboard, Flock Roster, Hierarchy Tree,
   sidebar, bottom nav, login. They now follow the blue tokens. About ten files still hard-code the old purple
   (`purple-*`, `#7C3AED`, `#8B5CF6`); `grep -rn "purple-\|7C3AED\|8B5CF6" app components`
   finds them. Charts in `components/dashboard/` hard-code hex colours too.
2. Swap in the real placeholder details above as the user sends them.
3. Propose a commit message and wait for approval before committing. Short, no AI
   attribution trailers.

Earlier, unrelated to the design work: `PLAN.md` Phase 0 (database, Vercel project) is still
open, and its Phase 6 boxes do not reflect the August UI work.
