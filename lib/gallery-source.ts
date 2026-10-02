import type { StaticImageData } from "next/image";
import { GALLERY_FALLBACK } from "@/lib/site-content";

/*
 * Where the landing-page gallery gets its photos.
 *
 * The photographers upload each service to a Google Drive folder. Listing those
 * folders through the Drive API gives a pool of candid photos; the page shows a
 * different selection from the pool every ROTATE_HOURS, and re-reads the folders
 * every REFRESH_SECONDS so new uploads appear without a deploy.
 *
 * Needs two environment variables:
 *   GOOGLE_DRIVE_API_KEY    an API key with the Drive API enabled
 *   GALLERY_DRIVE_FOLDERS   comma-separated folder IDs ("anyone with the link" sharing).
 *                           A folder of folders works too: each subfolder is one event.
 * Without them the gallery rotates through the photos bundled in the repo.
 *
 * Visitors never load from Google directly: photos are served through
 * /gallery-photo/[id]/[width], so no visitor IP reaches Drive.
 */

export const REFRESH_SECONDS = 3600;
const ROTATE_HOURS = 6;
const SHOWN = 16;
export const PHOTO_WIDTHS = [480, 960, 1600] as const;

export type GalleryPhoto = {
  key: string;
  /** a bundled photo, or a Drive file served through /gallery-photo */
  image: { kind: "local"; src: StaticImageData } | { kind: "drive"; id: string; width: number; height: number };
  alt: string;
  /** the event, from the folder name */
  event: string;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  imageMediaMetadata?: { width?: number; height?: number };
};

const API = "https://www.googleapis.com/drive/v3/files";

async function drive<T>(params: Record<string, string>, key: string, path = ""): Promise<T> {
  const url = `${API}${path}?${new URLSearchParams({ ...params, key, supportsAllDrives: "true" })}`;
  const res = await fetch(url, { next: { revalidate: REFRESH_SECONDS } });
  if (!res.ok) throw new Error(`Drive API ${res.status} for ${path || "files.list"}`);
  return res.json() as Promise<T>;
}

async function listFolder(folderId: string, key: string) {
  const { files } = await drive<{ files: DriveFile[] }>(
    {
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id,name,mimeType,imageMediaMetadata(width,height))",
      pageSize: "1000",
    },
    key,
  );
  return files;
}

/** Every photo in the configured folders, one level of subfolders deep. */
async function drivePool(key: string, folderIds: string[]): Promise<GalleryPhoto[]> {
  const pool: GalleryPhoto[] = [];
  const add = (files: DriveFile[], event: string) => {
    for (const f of files) {
      if (!f.mimeType.startsWith("image/")) continue;
      const width = f.imageMediaMetadata?.width ?? 1600;
      const height = f.imageMediaMetadata?.height ?? 2000;
      pool.push({
        key: f.id,
        image: { kind: "drive", id: f.id, width, height },
        alt: `A photo from ${event}`,
        event,
      });
    }
  };

  for (const id of folderIds) {
    const [{ name }, files] = await Promise.all([
      drive<{ name: string }>({ fields: "name" }, key, `/${id}`),
      listFolder(id, key),
    ]);
    add(files, tidy(name));
    for (const sub of files.filter((f) => f.mimeType === "application/vnd.google-apps.folder")) {
      add(await listFolder(sub.id, key), tidy(sub.name));
    }
  }
  return pool;
}

function tidy(folderName: string) {
  return folderName.trim().replace(/\s+/g, " ");
}

function localPool(): GalleryPhoto[] {
  return GALLERY_FALLBACK.map((g) => ({
    key: g.src.src,
    image: { kind: "local", src: g.src },
    alt: g.alt,
    event: g.event,
  }));
}

/** The whole pool, from Drive when configured, else the bundled photos. */
export async function galleryPool(): Promise<GalleryPhoto[]> {
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  const folders = (process.env.GALLERY_DRIVE_FOLDERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!key || folders.length === 0) return localPool();
  try {
    const pool = await drivePool(key, folders);
    return pool.length > 0 ? pool : localPool();
  } catch (err) {
    console.error("[gallery] falling back to bundled photos:", err);
    return localPool();
  }
}

/** This window's selection: the same for everyone, different every ROTATE_HOURS. */
export async function galleryNow(now = Date.now()): Promise<GalleryPhoto[]> {
  const pool = await galleryPool();
  const seed = Math.floor(now / (ROTATE_HOURS * 3600_000));
  return shuffle(pool, seed).slice(0, SHOWN);
}

// mulberry32: small, seedable, good enough for picking photos
function shuffle<T>(items: T[], seed: number): T[] {
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
