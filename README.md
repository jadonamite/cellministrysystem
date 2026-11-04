# BLWZONEG

The website of BLW Campus Ministry, Zone G, at FUTA Akure, together with Cell Ministry, the
signed-in app the zone's leaders use to run their cells.

## What it does

**The public site** (`/`) tells a visitor when and where to come: the service flyers, slides
from recent services, a sermon player, the next live event and a photo gallery. The gallery
reads the media team's shared Google Drive folders and shows a different set of photos every
six hours. Photos are served from this site, so visitors never connect to Google.

**Cell Ministry** (`/dashboard` and the pages beside it) is for leaders. It keeps the cell
hierarchy as a tree of any depth, the member roster, events, follow-ups and messages, and a
caller view for the outreach team.

Terms, privacy and cookie pages are at `/terms`, `/privacy` and `/cookies`.

## Running it

Needs Node 20 or later.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000.

## Configuration

All settings live in `.env.local`. `.env.example` lists each one with a note on what it is for.

| Setting | Needed for |
| --- | --- |
| `CALLCENTER_SESSION_SECRET` | Signing in |
| `ADMIN_ACCESS_CODE` | The admin code until one is set from Settings |
| `MONGODB_URI`, `MONGODB_DB` | Saving cells and members |
| `OUTREACH_API`, `OUTREACH_API_KEY` | Callers and live contact data |
| `GOOGLE_DRIVE_API_KEY`, `GALLERY_DRIVE_FOLDERS` | The live gallery (optional) |

## Layout

- `app/(site)/`: public pages
- `app/(app)/`: signed-in pages
- `app/gallery-photo/`: serves gallery photos from the Drive folders
- `components/site/`: landing-page sections
- `lib/`: data access, auth and site content
- `DESIGN.md`: type, colour, spacing and motion tokens
