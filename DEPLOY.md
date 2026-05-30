# Deploy to Vercel (with the admin backend)

The site is a Vite SPA plus serverless API routes in `/api`. Products live in
**Upstash Redis**, media in **Vercel Blob**, and admin auth is verified
server-side (scrypt password + signed httpOnly session cookie). No credentials
ship in the browser bundle.

## 1. Push the repo to GitHub and import it in Vercel
Vercel auto-detects Vite (build `npm run build`, output `dist`). The `/api`
folder is deployed as serverless functions automatically. `vercel.json` adds
the SPA fallback so `/admin` works on refresh.

## 2. Add storage (Vercel dashboard → Storage)
1. **Upstash Redis** (Marketplace → Redis). Connect it to the project — Vercel
   injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`; both are supported).
2. **Blob** (Storage → Blob → Create). Vercel injects `BLOB_READ_WRITE_TOKEN`.

## 3. Set the auth env vars (Project → Settings → Environment Variables)
Generate real values on your machine (Node required):

```bash
npm run hash-password 'YOUR_ADMIN_PASSWORD'   # → prints salt:hash
npm run gen-secret                            # → prints a random secret
```

Then add:

| Variable              | Value                                   |
|-----------------------|-----------------------------------------|
| `ADMIN_USERNAME`      | e.g. `admin`                            |
| `ADMIN_PASSWORD_HASH` | the `salt:hash` from `hash-password`    |
| `SESSION_SECRET`      | the value from `gen-secret`             |

Redeploy after adding env vars so the functions pick them up.

## 4. Use it
- Public site: `/`
- Admin: `/admin` → log in → edit products → **Salva modifiche**. Saved changes
  are stored in Redis and appear for **all** visitors immediately.
- Media: click a product's media box to upload an image/video (goes to Blob).

## Local development
- `npm run dev` — frontend only; `/api` does **not** run, so products show the
  defaults and admin save/login won't work. Fine for UI work.
- `npm run dev:api` (`vercel dev`) — runs the API too. Copy `.env.example` to
  `.env` and fill it in (use the Upstash console values + the generated hash/
  secret) to exercise the full admin flow locally.

## Security notes
- Credentials are never in the bundle; the password is only stored as an scrypt
  hash in a server env var, and the session cookie is httpOnly + signed.
- Rotate `SESSION_SECRET` to invalidate all existing sessions.
- The product PUT endpoint requires a valid session; uploads require it too.
