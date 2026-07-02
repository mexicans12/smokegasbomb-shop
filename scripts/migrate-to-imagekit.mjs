#!/usr/bin/env node
/* Bulk migration: re-uploads existing Cloudinary media to ImageKit.
   ImageKit pulls each file directly from the Cloudinary URL -- no local
   download needed.

   Usage:
     node scripts/migrate-to-imagekit.mjs

   Required env vars (set in .env or export before running):
     IMAGEKIT_PRIVATE_KEY
     IMAGEKIT_URL_ENDPOINT
     UPSTASH_REDIS_REST_URL   (or KV_REST_API_URL)
     UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_TOKEN)

   What it does:
     1. Reads all products from Redis.
     2. For each product whose media.src is a Cloudinary URL (res.cloudinary.com),
        uploads the file to ImageKit using the server-side upload API.
     3. Replaces media.src with the ImageKit URL and sets media.fileId.
     4. Writes the updated product list back to Redis.
     5. Prints a summary of migrated / skipped / failed items.

   Safe to re-run: products already pointing to ImageKit URLs are skipped.
   Cloudinary assets are NOT deleted -- clean them up manually once you are
   satisfied with the migration. */

import { createHmac } from "node:crypto";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "";
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || "";
const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
const REDIS_KEY = "sgb:products";
const IK_FOLDER = "/smokegasbomb";

if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
  console.error(
    "Error: set IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT before running."
  );
  process.exit(1);
}
if (!REDIS_URL || !REDIS_TOKEN) {
  console.error(
    "Error: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN before running."
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Redis helpers (minimal -- no SDK dependency)
// ---------------------------------------------------------------------------

async function redisGet(key) {
  const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Redis GET failed: ${JSON.stringify(body)}`);
  return body.result ?? null;
}

async function redisSet(key, value) {
  const res = await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Redis SET failed: ${JSON.stringify(body)}`);
}

// ---------------------------------------------------------------------------
// ImageKit server-side upload (accepts a URL as the file source)
// ---------------------------------------------------------------------------

async function uploadToImageKit(sourceUrl, fileName) {
  const auth = Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString("base64");
  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file: sourceUrl,
      fileName,
      folder: IK_FOLDER,
      useUniqueFileName: true,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `ImageKit upload failed (${res.status})`);
  }
  return { url: data.url, fileId: data.fileId };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const raw = await redisGet(REDIS_KEY);
const products = Array.isArray(raw) ? raw : JSON.parse(raw || "[]");

if (!products.length) {
  console.log("No products found in Redis. Nothing to migrate.");
  process.exit(0);
}

console.log(`Found ${products.length} product(s). Starting migration...\n`);

let migrated = 0;
let skipped = 0;
let failed = 0;

const updated = await Promise.all(
  products.map(async (p) => {
    const src = p?.media?.src || "";

    if (!src) {
      console.log(`[SKIP] Product ${p.id} "${p.name}": no media.`);
      skipped++;
      return p;
    }

    if (!src.includes("res.cloudinary.com")) {
      console.log(`[SKIP] Product ${p.id} "${p.name}": already on ImageKit or unknown host.`);
      skipped++;
      return p;
    }

    const fileName = src.split("/").pop()?.split("?")[0] || `product-${p.id}`;

    try {
      const { url, fileId } = await uploadToImageKit(src, fileName);
      console.log(`[OK]   Product ${p.id} "${p.name}": ${url}`);
      migrated++;
      return {
        ...p,
        media: {
          ...p.media,
          src: url,
          fileId,
          // remove Cloudinary-specific fields
          publicId: undefined,
          resourceType: undefined,
        },
      };
    } catch (err) {
      console.error(`[FAIL] Product ${p.id} "${p.name}": ${err.message}`);
      failed++;
      return p;
    }
  })
);

// Strip undefined fields before saving
const cleaned = updated.map((p) => {
  const m = { ...p.media };
  if (m.publicId === undefined) delete m.publicId;
  if (m.resourceType === undefined) delete m.resourceType;
  return { ...p, media: m };
});

if (migrated > 0) {
  await redisSet(REDIS_KEY, cleaned);
  console.log(`\nRedis updated.`);
}

console.log(`\nDone. Migrated: ${migrated} | Skipped: ${skipped} | Failed: ${failed}`);

if (failed > 0) {
  console.warn("Some uploads failed. Re-run the script to retry them.");
  process.exit(1);
}
