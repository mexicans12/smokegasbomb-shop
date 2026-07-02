/* ImageKit server helpers (signed admin API).
   Env (server-only): IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY,
                      IMAGEKIT_URL_ENDPOINT
   Replaces api/_lib/cloudinary.js. Delete that file once migration is complete. */

export function imagekitConfig() {
  return {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
  };
}

/** Delete one asset from ImageKit by fileId. Best-effort: returns
 *  true on success, false otherwise (never throws). */
export async function deleteAsset(fileId) {
  const { privateKey } = imagekitConfig();
  if (!privateKey || !fileId) return false;

  const auth = Buffer.from(`${privateKey}:`).toString("base64");
  try {
    const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Basic ${auth}` },
    });
    return res.ok || res.status === 404;
  } catch (e) {
    console.error("imagekit delete failed:", e?.message || e);
    return false;
  }
}

/** Delete many assets concurrently; best-effort. */
export async function deleteAssets(items) {
  await Promise.all(items.map(({ fileId }) => deleteAsset(fileId)));
}
