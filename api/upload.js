/* POST /api/upload → authorizes a direct-to-Blob client upload.
   The browser uploads the file straight to Vercel Blob (bypassing the
   serverless body-size limit, so large videos work); this endpoint only
   issues a short-lived token after verifying the admin session. */
import { handleUpload } from "@vercel/blob/client";
import { isAuthedReq } from "./_lib/auth.js";

export default async function handler(req, res) {
  try {
    const result = await handleUpload({
      request: req,
      body: req.body,
      onBeforeGenerateToken: async () => {
        if (!isAuthedReq(req)) throw new Error("Non autorizzato");
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "video/mp4",
            "video/webm",
            "video/quicktime",
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
        };
      },
      onUploadCompleted: async () => {
        /* no-op; the client receives the blob URL directly */
      },
    });
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message || "Upload non riuscito" });
  }
}
