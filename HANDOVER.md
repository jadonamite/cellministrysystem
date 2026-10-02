# Handover

Last sessions: 30 September to 2 October 2026. Nothing has been committed yet; every change
below is in the working tree.

## Where things stand

Commit `957fd79` (pushed to main) holds the first immersive rebuild, which the user then
rejected as not clean: the dark hero with a home-made crowd cut-out, heavy skeuomorphic keys,
small tilted gallery cards and photos where the flyers should be.

The second pass is in the working tree, not committed: a clean light layout with the zone's
flyers, a new "From the service" section for the designed recap slides, a self-updating
gallery, and Liquid Glass nav pills. Checked at 1440px and 390px, with and without reduced
motion, no console errors. The signed-in app screens pick up the blue palette through
tokens but have not been restyled.

## Decisions the user has made

- **Palette (2 October): stage blue and gold**, replacing green. Midnight `#070B24`, stage
  blue `#1E40D8`, gold `#E9B949`, cream `#F6EBDE`, rare magenta `#C2187A`. Taken from the
  zone's flyers and the blue-lit auditorium. See DESIGN.md.
- **Layout (2 October, second pass):** clean and light. Hero: one full-width photo, no
  cut-outs. Join us: the zone's flyers, whole, in a pinned horizontal run. New "From the
  service" section: the designed recap/excerpt carousels. Gallery: keep the curve from
  `gallery.jpeg` but with large photos, fed from a data source that rotates periodically.
  Nav: clean pills on Apple Liquid Glass. The first pass (depth-layer hero, dark skeuomorphic
  keys) was rejected; do not bring it back.
- The Get Acquainted (CEPC Akure) material is part of Zone G and may be used.
- The public site is **BLWZONEG** (BLW Campus Ministry, Zone G). "Cell Ministry" is the name
  of the signed-in app only. Do not put "Cell Ministry" on the landing page.
- Font is Google Sans Flex everywhere. Instrument Serif italic is the highlight face, one
  word or phrase per heading (`serif-highlight` utility).
- Landing order: hero, Join us, From the service, Listen in, Live event, Gallery, footer. The old sections (who we are, how a cell grows,
  structure) were dropped on request.
- Hero: statement centred, no subtext. The wordmark and section pills sit along the bottom
  of the hero and dock as a floating glass bar once the hero bar scrolls away.
- Service facts confirmed by the user: Cell Meetings are on Fridays. Sunday Service is
  9:45 AM and the venue is BLW Auditorium, Plot 13 beside IBK Filling Station, FUTA
  Southgate (both from the zone's own flyers).

The user was unhappy with the first landing attempt because a verbal layout ("banner, then
the words, then the links") was built as separate sections. When a layout is described in
words, sketch the first screen back as ASCII before building.

## Still placeholder (all in `lib/site-content.ts`)

- Lint errors exist in `app/(app)/dashboard/page.tsx` and `app/(app)/teams/page.tsx`
  (older than this work); fix during the app restyle.
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

Images: `public/images/zoneg/flyers/` (5 service flyers at 1600px from the BLW ZONE G Drive
folder), `public/images/zoneg/excerpts/` (Thanksgiving recap, 20 slides; Get Acquainted, 17),
`public/images/zoneg/live/` (bundled candid photos, the gallery fallback, and the hero).
No longer used by any page, delete once the user agrees: `public/images/stock/`,
`live/hero-crowd.png`, `live/hero-stage.jpg` and several other `live/` photos, and most of
the 640px Instagram copies in `public/images/zoneg/`.

Flyers deliberately left out: "Christ Embassy, Communion every first Sunday 3 PM" (times do
not match the zone's own flyer) and CEPC Akure's "Sunday Service 7:30 AM".

## Gallery data source (blocker for live photos)

`lib/gallery-source.ts` lists the photographers' Drive folders through the Drive API, re-reads
them hourly, and shows a different 16 every six hours. Photos are served through
`app/gallery-photo/[id]/[width]/route.ts`, which only serves files from those folders, so
visitors never contact Google. It needs two environment variables (`.env*` files are
gitignored, so they are documented here):

- `GOOGLE_DRIVE_API_KEY`: an API key from a Google Cloud project with the Drive API enabled,
  restricted to the Drive API.
- `GALLERY_DRIVE_FOLDERS`: comma-separated folder IDs shared as "anyone with the link". A
  folder of folders works: each subfolder is one event, so the media team can add a new
  service folder without a deploy.

Until both are set the gallery rotates the bundled photos. Not yet tested against the real
API because there is no key.

## What changed in the code

- Routing: the dashboard moved from `/` to `/dashboard`. Signed-in screens live in
  `app/(app)/` with the sidebar layout; public pages live in `app/(site)/`. `proxy.ts` lets
  `/`, `/terms`, `/privacy` and `/cookies` through without a session.
- Landing components: `components/site/` (hero, section-nav, join-us, listen-in,
  live-event, gallery, flyer-button, footer, consent-banner, legal-page, cell-mark,
  motion-root). `lib/use-reduced-motion.ts` is the hydration-safe reduced-motion hook; use it
  rather than framer's `useReducedMotion` wherever markup branches on the setting.
- `lib/gallery-source.ts`, `app/gallery-photo/[id]/[width]/route.ts` (public in `proxy.ts`),
  `components/site/excerpts.tsx`. Glass utilities `glass-clear` and `glass-regular` in
  `app/globals.css`.
- Gotcha: editing files with `sed -i` replaces the file, and the dev server's watcher can
  miss it. Write files in place (editor, Write tool, or Python) or the browser keeps old code.
- Legal pages, footer links and the cookie notice are in place. The cookie policy lists
  every cookie the app actually sets. None has had legal review, and each page says so.
- Tokens: `app/globals.css` (stage blue, gold, paper canvas, both themes, 44px targets,
  reduced motion and transparency). `DESIGN.md` explains them.
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
