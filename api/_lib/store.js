/* Shared product store backed by Upstash Redis (one JSON value).
   Reads/writes the whole products array under a single key. If Redis env
   vars are missing (e.g. not yet provisioned), reads fall back to defaults
   and writes throw a clear error. */
import { Redis } from "@upstash/redis";

const url =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

const redis = url && token ? new Redis({ url, token }) : null;
const KEY = "sgb:products";
const SETTINGS_KEY = "sgb:settings";

// Seed data -- also the fallback when storage isn't configured yet.
export const DEFAULT_PRODUCTS = [
  { id: 1, name: "Phantom", package: "A", quantity: 3.5, price: 45, media: { type: "image", src: "" } },
  { id: 2, name: "Eclipse", package: "B", quantity: 2, price: 50, media: { type: "image", src: "" } },
  { id: 3, name: "Aurora", package: "C", quantity: 5, price: 60, media: { type: "image", src: "" } },
  { id: 4, name: "Velvet", package: "A", quantity: 1, price: 65, media: { type: "image", src: "" } },
  { id: 5, name: "Tempo", package: "D", quantity: 3.5, price: 52, media: { type: "image", src: "" } },
  { id: 6, name: "Bloom", package: "B", quantity: 2.5, price: 56, media: { type: "image", src: "" } },
  { id: 7, name: "Crimson", package: "E", quantity: 5, price: 75, media: { type: "image", src: "" } },
  { id: 8, name: "Forbidden", package: "Z", quantity: 4, price: 80, media: { type: "image", src: "" } },
];

export async function getProducts() {
  if (!redis) return DEFAULT_PRODUCTS;
  try {
    const data = await redis.get(KEY);
    return Array.isArray(data) ? data : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export async function setProducts(products) {
  if (!redis) throw new Error("Storage non configurato (Upstash Redis)");
  await redis.set(KEY, products);
}

/* ---- site settings (social links) ----
   Stored as bare usernames (e.g. "iltuocanale"), not full URLs. The public
   site builds the t.me/ and instagram.com/ URLs from these. */
export const DEFAULT_SETTINGS = {
  telegram: "",
  instagram: "",
};

export async function getSettings() {
  if (!redis) return DEFAULT_SETTINGS;
  try {
    const data = await redis.get(SETTINGS_KEY);
    return data && typeof data === "object" ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function setSettings(settings) {
  if (!redis) throw new Error("Storage non configurato (Upstash Redis)");
  await redis.set(SETTINGS_KEY, settings);
}

/** Sanitize settings -- keep only known keys, reduce each value to a bare
    username (strip any pasted t.me/ or instagram.com/ URL and "@"). */
export function sanitizeSettings(s) {
  const handle = (v) =>
    String(v ?? "")
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/^(www\.)?(t\.me|telegram\.me|instagram\.com|instagr\.am)/i, "")
      .replace(/^[@/]+/, "")
      .replace(/\/+$/, "")
      .replace(/[^A-Za-z0-9._-]/g, "")
      .slice(0, 64);
  return {
    telegram: handle(s?.telegram),
    instagram: handle(s?.instagram),
  };
}

/** Keep only the known fields and coerce types -- never trust the client. */
export function sanitizeProduct(p, i) {
  const t = p?.media?.type === "video" ? "video" : "image";
  return {
    id: Number(p?.id) || i + 1,
    name: String(p?.name ?? "").slice(0, 80),
    package: String(p?.package ?? "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 1),
    quantity: Math.max(0, Math.min(100, Number(p?.quantity) || 0)),
    price: Math.max(0, Number(p?.price) || 0),
    media: {
      type: t,
      src: String(p?.media?.src ?? "").slice(0, 2048),
      ...(p?.media?.poster ? { poster: String(p.media.poster).slice(0, 2048) } : {}),
      ...(p?.media?.publicId ? { publicId: String(p.media.publicId).slice(0, 256) } : {}),
      ...(p?.media?.resourceType ? { resourceType: String(p.media.resourceType).slice(0, 16) } : {}),
    },
  };
}

/** Collect Cloudinary assets ({ publicId, resourceType }) referenced by
 *  a product list -- used to diff old vs new and delete orphaned uploads. */
export function collectAssets(products) {
  const map = new Map();
  for (const p of products || []) {
    const publicId = p?.media?.publicId;
    if (publicId) {
      map.set(publicId, { publicId, resourceType: p?.media?.resourceType || "image" });
    }
  }
  return map;
}
