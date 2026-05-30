/* GET  /api/products  → public: returns the product list
   PUT  /api/products  → protected: replaces the product list (admin only) */
import { getProducts, setProducts, sanitizeProduct } from "./_lib/store.js";
import { isAuthedReq } from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const products = await getProducts();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ products });
  }

  if (req.method === "PUT") {
    if (!isAuthedReq(req)) return res.status(401).json({ error: "Non autorizzato" });
    const incoming = req.body?.products;
    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: "Payload non valido" });
    }
    try {
      await setProducts(incoming.map(sanitizeProduct));
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Salvataggio non riuscito" });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ error: "Metodo non consentito" });
}
