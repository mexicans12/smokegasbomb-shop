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

// Seed data — also the fallback when storage isn't configured yet.
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

/* ---- site settings (social links) ---- */
export const DEFAULT_SETTINGS = {
  telegram: "https://t.me",
  instagram: "https://instagram.com",
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

/** Sanitize settings — keep only known keys, enforce http(s) URLs. */
export function sanitizeSettings(s) {
  const clean = (v, fallback) => {
    const str = String(v ?? "").trim().slice(0, 2048);
    return /^https?:\/\//i.test(str) ? str : fallback;
  };
  return {
    telegram: clean(s?.telegram, DEFAULT_SETTINGS.telegram),
    instagram: clean(s?.instagram, DEFAULT_SETTINGS.instagram),
  };
}

/** Keep only the known fields and coerce types — never trust the client. */
export function sanitizeProduct(p, i) {
  const t = p?.media?.type === "video" ? "video" : "image";
  return {
    id: Number(p?.id) || i + 1,
    name: String(p?.name ?? "").slice(0, 80),
    package: String(p?.package ?? "")
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 1),
    quantity: Math.max(0, Math.min(5, Number(p?.quantity) || 0)),
    price: Math.max(0, Number(p?.price) || 0),
    media: {
      type: t,
      src: String(p?.media?.src ?? "").slice(0, 2048),
      ...(p?.media?.poster ? { poster: String(p.media.poster).slice(0, 2048) } : {}),
    },
  };
}
