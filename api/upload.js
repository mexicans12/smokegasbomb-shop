/* POST /api/upload -- authorizes a Vercel Blob client upload.
   Admin-gated: only a logged-in admin can obtain a token. The browser
   then uploads the file directly to Vercel Blob (images + video).

   Env (server-only): BLOB_READ_WRITE_TOKEN (auto-injected by Vercel
   when a Blob store is connected to this project). */
import { handleUpload } from "@vercel/blob/client";
import { isAuthedReq } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("upload: BLOB_READ_WRITE_TOKEN missing");
    return res.status(500).json({
      error:
        "Archiviazione media non configurata: collega un Blob store al progetto su Vercel (Storage -- Create Database -- Blob), poi ridistribuisci.",
    });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!isAuthedReq(req)) {
          throw new Error("Non autorizzato. Effettua di nuovo l'accesso.");
        }
        return {
          allowedContentTypes: ["image/*", "video/*"],
          addRandomSuffix: true,
        };
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    return res.status(400).json({ error: error.message || "Upload non riuscito" });
  }
}
