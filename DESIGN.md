# Design system

The single source for how Cell Ministry looks and behaves. Tokens live in
`app/globals.css`; this file says what they mean. Supersedes the lavender direction in
SPEC.md §9.

References: `design/references/` (a camp-meeting poster, the Bethany church home page, the
Aeline landing page, and `gallery.jpeg` for the curved photo strip). Structure and behaviour
follow Apple's Human Interface Guidelines, ported to the web. Identity comes from the
zone's own material: its flyers and the photographers' service photos.

## The idea

The auditorium is lit blue and the zone's flyers are royal blue and gold, so the palette is
taken from the room itself: midnight, stage blue, gold and the cream of the flyer paper.

The page is clean and light. The ministry's own artwork is shown as artwork, whole and
uncropped; candid photos are shown large. Motion is reserved for scroll-driven depth and the
two horizontal runs; nothing is cut out, masked or layered over a photo.

Gold is rare: it marks the most important thing in a view.

## The landing page

The public site is branded BLWZONEG (BLW badge + "BLWZONEG"). "Cell Ministry" is the name of
the signed-in app only. One photo hero, then light sections:

1. Hero: one full-width photo (FYB Thanksgiving Sunday) with the statement "Giving your life
   a meaning." on a soft shade across the top. The photo lags the scroll slightly. Wordmark
   and the section pills sit along the bottom on clear glass.
2. Join us (cream): the zone's flyers, whole, in a pinned horizontal run: the section holds
   still while vertical scrolling slides the row sideways. Title and time under each flyer,
   a venue card with directions at the end.
3. From the service (white): the media team's designed recap and excerpt slides, one
   swipeable row per set.
4. Listen in (cream): the audio player on a white card.
5. Live event (cream): the LIFT flyer beside its details on a white card.
6. Gallery (white): follows `design/references/gallery.jpeg`. Large candid photos bent
   around a cylinder; a real horizontal scroller with page-scroll drift. The photos come from
   the photographers' Drive folders and the selection changes every six hours
   (`lib/gallery-source.ts`); until the Drive key is set it rotates the bundled photos.

Reduced motion turns the movement off: the hero is still, Join us is a swipeable row at
normal height, the gallery is flat.

Content lives in `lib/site-content.ts`.

## Navigation (Liquid Glass)

Section pills on Liquid Glass, ported per the HIG web translation: `glass-clear` over the
hero photo (already dimmed by the hero's shade, so no extra dimming), `glass-regular` for the
copy that docks at the bottom of the screen over light content. Glass is for navigation only,
never content. Both fall back to a solid surface when `backdrop-filter` is unsupported, under
reduced transparency and under increased contrast. No imitation specular highlights. The
current section is a solid ink pill; "Sign in" is the gold pill.

## Colour

Semantic tokens only in the app. Components never name a raw hex value or a Tailwind palette
colour. The public page uses fixed landing colours (`midnight`, `midnight-2`, `stage`,
`cream`, `ink`, `magenta`) because it is always dark-to-cream, whatever the theme.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `#F7F3EC` | `#070B24` | Canvas: warm paper / midnight |
| `--card` | `#FFFFFF` | `#10163A` | Content surfaces |
| `--popover` | `#FFFFFF` | `#171E48` | Raised: menus, sheets, modals |
| `--foreground` | `#0B1030` | `#F6EBDE` | Label: ink / cream |
| `--label-2` | `#4A4F66` | `#A9AFCB` | Secondary label |
| `--label-3` | `#666B84` | `#7E85A6` | Tertiary label (4.5:1 minimum on card) |
| `--border` | `#E2DCD0` | `rgb(255 255 255 / 0.09)` | Separator |
| `--primary` | `#1E40D8` | `#7B93FF` | Stage blue: actions, active state, links |
| `--band` | `#1E40D8` | `#1E40D8` | Stage blue for large bold areas |
| `--highlight` | `#E9B949` | `#E9B949` | Gold: the one thing per screen |
| `--destructive` | `#C4352B` | `#F0645A` | Irreversible or failed |

Contrast, measured: ink on canvas 16.8:1, secondary 7.3:1, tertiary on card 5.3:1, white on
stage blue 7.6:1, ink on gold 10.2:1, cream on midnight 16.5:1, gold on midnight 10.6:1,
dark-mode primary on card 6.2:1. Text on gold is always ink, never white.

Hierarchy colours for the tree (a cell inherits its team's hue): blue, gold, magenta, teal,
violet (`--team-1` to `--team-5`). Colour never carries meaning alone; every hue sits beside
the unit's name.

## Type

Google Sans Flex everywhere, loaded with `next/font`. Display headlines set it at weight
800, tracking -0.035em, line-height 0.95 (`display` utility).

Instrument Serif italic is the highlight face (`serif-highlight` utility): one word or
phrase per heading, never a whole sentence.

Interface scale, from the HIG at default Dynamic Type, in rem:

| Role | Size | Line height | Weight |
|---|---|---|---|
| Large title | 2.25rem | 1.07 | 700 |
| Title 1 | 2.125rem | 1.07 | 700 |
| Title 2 | 1.75rem | 1.09 | 700 |
| Title 3 | 1.1875rem | 1.13 | 600 |
| Headline | 1rem | 1.16 | 600 |
| Body | 1rem | 1.16 (UI) / 1.55 (prose) | 400 |
| Caption 1 | 0.9375rem | 1.17 | 400 |
| Caption 2 | 0.875rem | 1.18 | 400 |
| Footnote | 0.8125rem | 1.19 | 400 |

Floor: 0.75rem for anything a person must read. Hierarchy comes from weight and colour
before size. Labels are sentence case, semibold, secondary colour. The one exception is the
Join us poster, which uses capitals because the reference does.

## Spacing

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 96 · 128` px, the Tailwind steps 1, 2,
3, 4, 5, 6, 8, 10, 12, 16, 24, 32. No arbitrary values. 16px is the phone edge margin,
always combined with the safe-area inset.

## Targets

44 x 44px minimum hit region for anything tappable, reached with padding rather than a
bigger glyph. At least 8px between adjacent targets.

## Radius

| Step | Value | Used for |
|---|---|---|
| sm | 10px | Chips inside cards, inputs |
| md | 16px | Small tiles, list rows |
| lg | 24px | Cards |
| xl | 36px | Landing bands and hero tiles |
| full | 9999px | App buttons and pills |

Buttons are pills. Flyers and photo cards are 18 to 24px; white section cards 24 to 32px.

## Elevation

| Level | Light | Dark | Meaning |
|---|---|---|---|
| 0 | none | none | Content on the canvas |
| 1 | `--lift-1` soft shadow | tone step (card is lighter) | Cards |
| 2 | `--lift-2` + glass | tone step + glass | Floating nav, toolbars |
| 3 | `--lift-3` | tone step + border | Sheets, modals, popovers |

Glass (backdrop blur) belongs to level 2 only: floating navigation. Never on content.
It falls back to a solid surface under `prefers-reduced-transparency`,
`prefers-contrast: more`, and where `backdrop-filter` is unsupported.

## Motion

| Token | Duration | Use |
|---|---|---|
| `--dur-1` | 150ms | State changes: hover, press, toggles |
| `--dur-2` | 250ms | Standard transitions, sheets |
| `--dur-3` | 350ms | Large moves, page-level reveals |

Arriving eases out `cubic-bezier(0.22, 1, 0.36, 1)`; leaving eases in
`cubic-bezier(0.4, 0, 1, 1)`. Motion explains where something came from. On the landing
page the only thing that moves without input is the statement reveal on load; everything
else is tied to scroll or pointer, and describes depth.

Reduced motion: the global CSS block collapses durations, Framer Motion runs under
`MotionConfig reducedMotion="user"`, and components branch on `useReducedMotionSafe()`
(`lib/use-reduced-motion.ts`), which hydrates as `false` and then re-renders, so the
server and browser never disagree.

## Imagery

Real photographs of people, never icon grids, and never a cut-out or mask unless it is
clean. Flyers are in `public/images/zoneg/flyers/`, designed slides in
`public/images/zoneg/excerpts/`, bundled candid photos in `public/images/zoneg/live/`.
Sources are in `public/images/zoneg/SOURCE.md`.

## Accessibility sweep, before anything ships

Keyboard path through every control, visible `:focus-visible` rings (2px primary, 2px
offset; gold on midnight), 200% zoom without breakage, reduced motion and transparency honoured, accessible
names on every non-text control.
