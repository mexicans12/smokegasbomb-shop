/* POST /api/upload -- returns short-lived ImageKit upload auth params.
   Admin-gated: only a logged-in admin can obtain a signature. The browser
   then uploads the file directly to ImageKit's CDN (images + video).

   Env (server-only): IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY,
                      IMAGEKIT_URL_ENDPOINT */
import { createHmac, randomUUID } from "node:crypto";
import { isAuthedReq } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  if (!isAuthedReq(req)) {
    return res.status(401).json({ error: "Non autorizzato. Effettua di nuovo l'accesso." });
  }

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    console.error("upload: ImageKit env vars missing");
    return res.status(500).json({
      error:
        "Archiviazione media non configurata: imposta IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY e IMAGEKIT_URL_ENDPOINT su Vercel, poi ridistribuisci.",
    });
  }

  // ImageKit client-side upload auth: HMAC-SHA1(token + expire, privateKey)
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 min
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");

  return res.status(200).json({ publicKey, token, expire, signature });
}
