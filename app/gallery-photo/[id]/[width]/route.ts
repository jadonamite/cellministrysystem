import { galleryPool, PHOTO_WIDTHS } from "@/lib/gallery-source";

/*
 * Serves one gallery photo from Google Drive at a fixed width, so visitors'
 * browsers never contact Google. Only files in the configured gallery folders
 * are served; anything else is a 404, which keeps this from being an open proxy.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; width: string }> }) {
  const { id, width } = await params;
  const w = Number(width);
  if (!/^[\w-]{10,100}$/.test(id) || !PHOTO_WIDTHS.includes(w as (typeof PHOTO_WIDTHS)[number])) {
    return new Response("Not found", { status: 404 });
  }

  const pool = await galleryPool();
  if (!pool.some((p) => p.image.kind === "drive" && p.image.id === id)) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = await fetch(`https://drive.google.com/thumbnail?id=${id}&sz=w${w}`, {
    next: { revalidate: 86400 },
  });
  if (!upstream.ok || !upstream.body) return new Response("Photo unavailable", { status: 502 });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
