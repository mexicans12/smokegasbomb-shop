/* POST /api/upload → returns short-lived Cloudinary upload signing params.
   Admin-gated: only a logged-in admin can obtain a signature. The browser
   then uploads the file directly to Cloudinary's CDN (images + video).

   Env (server-only): CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
                      CLOUDINARY_API_SECRET */
import { createHash } from "node:crypto";
import { isAuthedReq } from "./_lib/auth.js";

const FOLDER = "smokegasbomb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  if (!isAuthedReq(req)) {
    return res.status(401).json({ error: "Non autorizzato. Effettua di nuovo l'accesso." });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("upload: Cloudinary env vars missing");
    return res.status(500).json({
      error:
        "Archiviazione media non configurata: imposta CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET su Vercel, poi ridistribuisci.",
    });
  }

  // Cloudinary signature: sha1 of the alphabetically-sorted params to sign +
  // the API secret. We sign `folder` and `timestamp`.
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${FOLDER}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(toSign + apiSecret).digest("hex");

  return res.status(200).json({ cloudName, apiKey, timestamp, signature, folder: FOLDER });
}
