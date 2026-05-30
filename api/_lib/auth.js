/* Server-side admin auth helpers (Vercel serverless, Node runtime).
   - Password is verified against a scrypt hash stored in ADMIN_PASSWORD_HASH
     (format "salt:hash", both hex). Plaintext lives nowhere.
   - The session is an HMAC-signed token in an httpOnly, Secure, SameSite
     cookie — the client can't read or forge it. */
import { scryptSync, timingSafeEqual, createHmac } from "node:crypto";

const COOKIE = "sgb_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours (seconds)

/** Verify a plaintext password against ADMIN_PASSWORD_HASH ("salt:hash"). */
export function verifyPassword(password) {
  const stored = process.env.ADMIN_PASSWORD_HASH || "";
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  let actual;
  try {
    actual = scryptSync(String(password), salt, expected.length);
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function secret() {
  return process.env.SESSION_SECRET || "";
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || !secret()) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]),
  );
}

// Secure cookies require HTTPS; skip the Secure flag only under `vercel dev`.
function isProdLike() {
  return process.env.VERCEL_ENV !== "development";
}

export function makeSessionCookie() {
  const token = sign({ sub: "admin", exp: Date.now() + MAX_AGE * 1000 });
  const secure = isProdLike() ? " Secure;" : "";
  return `${COOKIE}=${token}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie() {
  const secure = isProdLike() ? " Secure;" : "";
  return `${COOKIE}=; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=0`;
}

export function isAuthedReq(req) {
  const cookies = parseCookies(req.headers?.cookie || "");
  return !!verifyToken(cookies[COOKIE]);
}
