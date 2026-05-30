/* GET /api/session → { authed: boolean } based on the session cookie */
import { isAuthedReq } from "./_lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ authed: isAuthedReq(req) });
}
