/* ---- admin auth (server-backed) ----
   All verification happens on the backend (/api/login, /api/session,
   /api/logout). The session lives in an httpOnly cookie the browser JS
   can't read, and no credential or hash ships in the client bundle. */

export async function login(username, password) {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function logout() {
  try {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
  } catch {
    /* ignore */
  }
}

export async function checkSession() {
  try {
    const res = await fetch("/api/session", { credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.authed;
  } catch {
    return false;
  }
}
