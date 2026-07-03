/* Vercel Blob server helpers.
   Env (server-only): BLOB_READ_WRITE_TOKEN (auto-injected by Vercel when
   a Blob store is connected to this project). */
import { del } from "@vercel/blob";

/** Delete many blobs by URL; best-effort (never throws). */
export async function deleteAssets(items) {
  const urls = (items || []).map((i) => i.url).filter(Boolean);
  if (!urls.length) return;
  try {
    await del(urls);
  } catch (e) {
    console.error("blob delete failed:", e?.message || e);
  }
}
