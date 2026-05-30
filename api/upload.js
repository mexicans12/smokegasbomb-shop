/* POST /api/upload → authorizes a direct-to-Blob client upload.
   The browser uploads the file straight to Vercel Blob (bypassing the
   serverless body-size limit, so large videos work); this endpoint only
   issues a short-lived token after verifying the admin session. */
import { handleUpload } from "@vercel/blob/client";
import { isAuthedReq } from "./_lib/auth.js";

export default async function handler(req, res) {
  // Require a valid admin session before issuing any upload token.
  if (!isAuthedReq(req)) {
    return res.status(401).json({ error: "Non autorizzato. Effettua di nuovo l'accesso." });
  }

  // Without a Blob read-write token the SDK can't mint an upload token.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("upload: BLOB_READ_WRITE_TOKEN is not set");
    return res.status(500).json({
      error:
        "Archiviazione media non configurata: manca BLOB_READ_WRITE_TOKEN. Collega lo store Blob al progetto e ridistribuisci.",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const result = await handleUpload({
      request: req,
      body,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => ({
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
        addRandomSuffix: true,
      }),
      // No onUploadCompleted: the browser gets the blob URL directly from the
      // upload, so we avoid waiting on the extra server callback round-trip.
    });
    return res.status(200).json(result);
  } catch (e) {
    console.error("upload error:", e?.message || e);
    return res.status(400).json({ error: e?.message || "Upload non riuscito" });
  }
}
