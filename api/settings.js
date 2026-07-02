/* GET  /api/settings  → public: returns site settings (social links)
   PUT  /api/settings  → protected: replaces site settings (admin only) */
import { getSettings, setSettings, sanitizeSettings } from "./_lib/store.js";
import { isAuthedReq } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const settings = await getSettings();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ settings });
  }

  if (req.method === "PUT") {
    if (!isAuthedReq(req)) return res.status(401).json({ error: "Non autorizzato" });
    try {
      await setSettings(sanitizeSettings(req.body?.settings));
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Salvataggio non riuscito" });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Metodo non consentito" });
}
