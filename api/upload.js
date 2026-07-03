/* POST /api/upload -- returns short-lived Cloudinary upload signature.
   Admin-gated: only a logged-in admin can obtain a signature. The browser
   then uploads the file directly to Cloudinary's CDN (images + video).

   Env (server-only): CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
                      CLOUDINARY_API_SECRET */
import { isAuthedReq } from "./_lib/auth.js";
import { cloudinaryConfig, signUpload } from "./_lib/cloudinary.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  if (!isAuthedReq(req)) {
    return res.status(401).json({ error: "Non autorizzato. Effettua di nuovo l'accesso." });
  }

  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    console.error("upload: Cloudinary env vars missing");
    return res.status(500).json({
      error:
        "Archiviazione media non configurata: imposta CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET su Vercel, poi ridistribuisci.",
    });
  }

  return res.status(200).json(signUpload("smokegasbomb"));
}
