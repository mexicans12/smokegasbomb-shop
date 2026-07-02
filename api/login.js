/* POST /api/login  { username, password } → sets the session cookie */
import { verifyPassword, makeSessionCookie } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const { username, password } = req.body || {};
  const userOk = String(username || "") === (process.env.ADMIN_USERNAME || "");
  const passOk = verifyPassword(password || "");

  if (!userOk || !passOk) {
    return res.status(401).json({ error: "Credenziali non valide" });
  }

  res.setHeader("Set-Cookie", makeSessionCookie());
  return res.status(200).json({ ok: true });
}
