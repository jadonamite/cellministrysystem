---
name: ui-design
description: >-
  Design system, UI rebranding, and component guidelines for the Cell Ministry System.
  Use when building, restyling, or auditing UI components, layouts, pages, animations,
  and color tokens to ensure adherence to the Apple-inspired lavender & ambient aubergine design language.
---

# Cell Ministry UI Design & Rebranding Skill

This skill governs the visual language, design system tokens, layout conventions, and interaction patterns for the **Cell Ministry System**.

---

## 1. Core Philosophy: *"A lot without feeling like a lot"*

The app presents dense hierarchy data (Zone → Group → Chapter → PCF → Team → Senior Cell → Cell), roster metrics, and multi-level roll-ups.
- **Density is the requirement; the feeling of density is the enemy.**
- **Richness is atmosphere; content is calm.**

### Five Iron Rules
1. **The Iridescence is Ambient. Data Never Sits on It.**
   Ambient prismatic blooms (`#FFB86B`, `#FF9ECD`, `#7FE3E8`, `#C77DFF`) stay blurred, soft, and pinned to background edge layers. Cards, tables, and lists sit on solid or semi-opaque purple-glass surfaces above the bloom.
2. **Generous Space Over Borders.**
   Avoid boxes inside boxes or borders where whitespace cleanly segments elements.
3. **One Accent System (Lavender) + One Single Focal Gold.**
   Lavender (`#B794F6` / `#C9AAFF`) handles hierarchy, focus, interactive states, and active items. Gold (`#F5C563`) is strictly reserved for the single highest-priority number or call-to-action on the screen.
4. **Progressive Disclosure.**
   Top-level views display 3–5 large, calm headline numbers. Deep operational details live in drilldown sheets or modals.
5. **Motion as Explanation.**
   Framer-motion transitions explain spatial origin (expanding from origin node/card). No bouncy or purely decorative animations.

---

## 2. Color Palette & Tokens

| Token Name | Hex / RGBA | Role & Application |
|---|---|---|
| `--canvas` | `#150C24` | Page base canvas — deep aubergine, near-black |
| `--surface` | `#211539` | Standard cards, panels, list containers |
| `--surface-raised` | `#2E1B4D` | Modals, sheets, popovers, active hover |
| `--stroke` | `rgba(183, 148, 246, 0.22)` | Subtle lavender glass border for surfaces |
| `--stroke-subtle` | `rgba(255, 255, 255, 0.08)` | Internal dividers and table row separators |
| `--accent` | `#B794F6` | Primary lavender accent (buttons, tabs, active indicators) |
| `--accent-bright` | `#C9AAFF` | Gloss light-edge, focus rings, hover highlights |
| `--gold` | `#F5C563` | Single focal metric (e.g. pending promotions requiring action) |
| `--gold-soft` | `rgba(245, 197, 99, 0.15)` | Background pill for gold badge/highlight |
| `--text` | `#FFFFFF` | Primary body and headings |
| `--text-muted` | `#C9BEDD` | Labels, captions, secondary metadata |
| `--text-subtle` | `#8E82A6` | Placeholders, timestamps, tertiary notes |

### Ambient Bloom Hues
- `#FFB86B` (Warm Peach)
- `#FF9ECD` (Soft Rose)
- `#7FE3E8` (Cyan Light)
- `#C77DFF` (Electric Lavender)
*Use strictly in `.ambient-bloom` or background irradiance filters.*

---

## 3. Surface & Gloss Recipe

To craft Apple-scale glossy elements:

```css
/* Glossy Button / Card Top Edge */
.gloss-surface {
  background: linear-gradient(180deg, rgba(46, 27, 77, 0.85) 0%, rgba(33, 21, 57, 0.95) 100%);
  border: 1px solid rgba(183, 148, 246, 0.18);
  box-shadow: 
    inset 0 1px 0 0 rgba(201, 170, 255, 0.35), /* Top light catch */
    0 8px 32px -4px rgba(0, 0, 0, 0.4);        /* Soft deep lift */
  backdrop-filter: blur(16px);
  border-radius: 1rem; /* 16px */
}

/* Primary Lavender Gloss Button */
.gloss-btn-primary {
  background: linear-gradient(180deg, #B794F6 0%, #9D71EB 100%);
  color: #150C24;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
    0 4px 16px rgba(183, 148, 246, 0.35);
}
```

---

## 4. Typography Scale

- **Display Numbers / Hero:** 36px – 48px, SemiBold/Bold, `#FFFFFF` or `#F5C563`
- **Section Headers:** 20px – 24px, SemiBold, `#FFFFFF`
- **Card Titles:** 14px – 16px, Medium/SemiBold, `#FFFFFF`
- **Labels / Captions:** 12px – 13px, Medium, `#C9BEDD`, uppercase tracking where appropriate (`tracking-wider`)
- **Mono Stats / IDs:** Monospace, Geist Mono or system mono, `#C9BEDD`

---

## 5. Component Patterns

### 1. Stat Cards
- Single large figure (`text-3xl font-semibold`)
- Top label in `text-xs uppercase tracking-wider text-[#C9BEDD]`
- Contextual micro-trend or badge (e.g. `+12% retention`)
- If this card represents an action item (e.g. "4 Promotions Ready"), use the **Gold Highlight** state.

### 2. Unit Tree & Hierarchy Nodes
- Depth indicated by subtle indentation, clean connection stroke (`--stroke`), and level badges.
- Badges use muted lavender tones (`bg-[#B794F6]/15 text-[#C9AAFF]`).

### 3. Data Tables & Rosters
- No heavy column borders.
- Row hover: subtle background tint (`hover:bg-[#2E1B4D]/60`).
- Status indicators: Clean pill badges (`New Member`, `BST`, `Member`, `Leader`).

### 4. Interactive Modals & Sheets
- Elevated glossy surface (`--surface-raised`).
- Close button positioned top-right with soft hover circle.
- Action bar fixed at bottom with blur backdrop.

---

## 6. Prototyping & Generative UI

When previewing designs:
- Use `generative_ui` HTML artifacts with Tailwind and CSS variables matching these tokens.
- Keep layout responsive (Mobile first for Cell Leaders on phones; responsive desktop sidebar for Admins/Pastors).
