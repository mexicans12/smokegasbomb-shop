/* ---- site settings access (social links) ----
   Public site reads via loadSettings(); the /admin CMS writes via
   saveSettings(). Backed by the /api/settings endpoint (Redis). */

export const DEFAULT_SETTINGS = {
  telegram: "https://t.me",
  instagram: "https://instagram.com",
};

export async function loadSettings() {
  try {
    const res = await fetch("/api/settings", { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.settings && typeof data.settings === "object") {
      return { ...DEFAULT_SETTINGS, ...data.settings };
    }
  } catch {
    /* API unavailable → defaults */
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings) {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ settings }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok !== true) {
    throw new Error(data.error || "Salvataggio non riuscito");
  }
  return true;
}
