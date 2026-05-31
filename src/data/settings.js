/* ---- site settings access (social links) ----
   Public site reads via loadSettings(); the /admin CMS writes via
   saveSettings(). Backed by the /api/settings endpoint (Redis). */

/* Social links are stored as bare usernames (e.g. "iltuocanale"), not full
   URLs. The admin only types the username; the public buttons build the URL
   via telegramUrl()/instagramUrl(). */
export const DEFAULT_SETTINGS = {
  telegram: "",
  instagram: "",
};

/** Extract a bare username from a stored value or a pasted full URL. */
export function socialHandle(value) {
  return (value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(t\.me|telegram\.me|instagram\.com|instagr\.am)/i, "")
    .replace(/^[@/]+/, "")
    .replace(/\/+$/, "");
}

/** Build a full Telegram URL from a username (or legacy full URL). */
export function telegramUrl(value) {
  const handle = socialHandle(value);
  return handle ? `https://t.me/${handle}` : "https://t.me";
}

/** Build a full Instagram URL from a username (or legacy full URL). */
export function instagramUrl(value) {
  const handle = socialHandle(value);
  return handle ? `https://instagram.com/${handle}` : "https://instagram.com";
}

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
