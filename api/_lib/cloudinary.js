/* Cloudinary server helpers (signed admin API).
   Env (server-only): CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
                      CLOUDINARY_API_SECRET */
import { createHash } from "node:crypto";

export function cloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  };
}

/** Delete one asset from Cloudinary by public_id. Best-effort: returns
 *  true on success, false otherwise (never throws). */
export async function destroyAsset(publicId, resourceType = "image") {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret || !publicId) return false;

  const type = resourceType === "video" ? "video" : "image";
  const timestamp = Math.floor(Date.now() / 1000);
  // signature = sha1 of sorted params-to-sign + api secret
  const toSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(toSign + apiSecret).digest("hex");

  const form = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: apiKey,
    signature,
  });

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${type}/destroy`,
      { method: "POST", body: form },
    );
    const data = await res.json().catch(() => ({}));
    return data?.result === "ok" || data?.result === "not found";
  } catch (e) {
    console.error("cloudinary destroy failed:", e?.message || e);
    return false;
  }
}

/** Destroy many assets concurrently; best-effort. */
export async function destroyAssets(items) {
  await Promise.all(
    items.map(({ publicId, resourceType }) => destroyAsset(publicId, resourceType)),
  );
}
