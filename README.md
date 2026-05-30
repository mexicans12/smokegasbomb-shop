# Smoke Gas Bomb

Dark, neon "private shop" landing page for **Smoke Gas Bomb**, built with React 19 + Vite + Tailwind v4, plus a server-backed admin CMS.

## Stack
- **Frontend:** React 19, Vite 6, Tailwind v4, Motion, React Router
- **Backend (Vercel Functions):** product API + admin auth in `/api`
- **Storage:** Upstash Redis (products) + Vercel Blob (media)

## Features
- Age-gate entry screen (content only loads after verification)
- Hero with floating logo + smoke effect, product catalogue, Italy map, contact CTA
- Italian UI, gold/red palette from the brand logo
- `/admin` CMS: login + add/edit/delete products (name, package letter, quantity, price, image/video)

## Local development
```bash
npm install
npm run dev        # frontend only (API not running → default products)
npm run dev:api    # vercel dev → runs the API too (needs .env)
```

## Deploy
See [DEPLOY.md](./DEPLOY.md) for the full Vercel setup (storage + env vars).

## Admin credentials
Set server-side env vars — see DEPLOY.md. Generate with:
```bash
npm run hash-password 'your-password'
npm run gen-secret
```
