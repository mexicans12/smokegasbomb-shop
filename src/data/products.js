/* ---- product data access (talks to the backend API) ----
   Public site reads via loadProducts(); the /admin CMS writes via
   saveProducts(); media is uploaded to Cloudinary via uploadMedia().

   Product shape (admin-editable variables):
     id, name, package (A-Z), quantity (grams 0-100), price (number),
     media { type: "image"|"video", src, poster?, publicId?, resourceType? }

   NOTE: under `npm run dev` (plain Vite) the /api routes don't run, so
   loadProducts() falls back to DEFAULT_PRODUCTS and writes/login will fail.
   Use `vercel dev` (or a Vercel deploy/preview) to exercise the backend. */

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Phantom", package: "A", quantity: 3.5, price: 45, media: { type: "image", src: "" } },
  { id: 2, name: "Eclipse", package: "B", quantity: 2, price: 50, media: { type: "image", src: "" } },
  { id: 3, name: "Aurora", package: "C", quantity: 5, price: 60, media: { type: "image", src: "" } },
  { id: 4, name: "Velvet", package: "A", quantity: 1, price: 65, media: { type: "image", src: "" } },
  { id: 5, name: "Tempo", package: "D", quantity: 3.5, price: 52, media: { type: "image", src: "" } },
  { id: 6, name: "Bloom", package: "B", quantity: 2.5, price: 56, media: { type: "image", src: "" } },
  { id: 7, name: "Crimson", package: "E", quantity: 5, price: 75, media: { type: "image", src: "" } },
  { id: 8, name: "Forbidden", package: "Z", quantity: 4, price: 80, media: { type: "image", src: "" } },
];

export async function loadProducts() {
  try {
    const res = await fetch("/api/products", { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (Array.isArray(data.products)) return data.products;
  } catch {
    /* API unavailable (e.g. local vite dev) -- fall back to defaults */
  }
  return DEFAULT_PRODUCTS;
}

export async function saveProducts(products) {
  const res = await fetch("/api/products", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ products }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok !== true) {
    throw new Error(data.error || "Salvataggio non riuscito (API non disponibile?)");
  }
  return true;
}

/** Upload an image/video to Cloudinary (signed); returns
 *  { type, src, publicId, resourceType }.
 *  1) get short-lived auth params from our admin-gated /api/upload
 *  2) upload the file directly to Cloudinary's CDN via XHR (for progress)
 *  onProgress(percent 0-100) is called as the file uploads. */
export async function uploadMedia(file, onProgress) {
  const report = (p) => {
    if (typeof onProgress === "function") onProgress(Math.max(0, Math.min(100, p)));
  };
  report(0);

  // 1. signed auth params from our backend (requires admin session)
  const sigRes = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
  });
  const sig = await sigRes.json().catch(() => ({}));
  if (!sigRes.ok) {
    throw new Error(sig.error || "Impossibile ottenere i parametri di upload");
  }

  const type = file.type.startsWith("video/") ? "video" : "image";
  const resourceType = type === "video" ? "video" : "image";

  // 2. direct upload to Cloudinary via XHR so we can track upload progress
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const up = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`,
    );
    xhr.timeout = 120000; // 2 min ceiling

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) report((e.loaded / e.total) * 100);
    };
    // file sent; Cloudinary still processing -- show near-complete
    xhr.upload.onload = () => report(99);

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        report(100);
        resolve(data);
      } else {
        reject(new Error(data?.error?.message || "Upload su Cloudinary non riuscito"));
      }
    };
    xhr.onerror = () => reject(new Error("Errore di rete durante l'upload"));
    xhr.ontimeout = () => reject(new Error("Upload scaduto. Riprova."));

    xhr.send(form);
  });

  // publicId + resourceType let the backend delete this asset when the
  // media is replaced or removed
  return { type, src: up.secure_url, publicId: up.public_id, resourceType };
}

/* ---- helpers ---- */
function nextId(products) {
  return products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
}

export function blankProduct(products) {
  return {
    id: nextId(products),
    name: "Nuovo prodotto",
    package: "A",
    quantity: 1,
    price: 0,
    media: { type: "image", src: "" },
  };
}

/* ---- display formatters (single source of truth for units/currency) ---- */
export const formatPrice = (n) => `€${n}`;
export const formatGrams = (g) => `${String(g).replace(".", ",")} g`;
