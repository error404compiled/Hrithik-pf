# Migrated frontend (Vite + React + JavaScript)

This folder is a **frontend-only** migration of `../hritiksharma.me` from Next.js (TypeScript) to **Vite**, **React**, **JavaScript**, and **React Router**.

## Install

```bash
cd migrated-frontend
npm install
```

## Run / build

```bash
npm run dev
npm run build
npm run preview
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Optional origin for `/api/chat`, `/api/views/:slug`, `/api/contact` when the UI is not same-origin with the backend. |
| `VITE_APPWRITE_ENDPOINT` | Appwrite endpoint (`.../v1`). |
| `VITE_APPWRITE_PROJECT_ID` | Appwrite project ID. |
| `VITE_APPWRITE_DATABASE_ID` | Appwrite database ID for portfolio data. |
| `VITE_APPWRITE_POSTS_COLLECTION_ID` | Appwrite posts collection used by blog pages. |
| `VITE_APPWRITE_CONTACT_COLLECTION_ID` | Appwrite contact submissions collection. |
| `VITE_APPWRITE_VIEWS_COLLECTION_ID` | Appwrite views collection. |
| `VITE_ADMIN_EMAIL` | Only this email can access `/update-vlog` editor actions. |

Copy `.env.example` to `.env` and adjust. Vite only exposes variables prefixed with `VITE_`.

## Removed (vs Next app)

- `next`, `eslint-config-next`, `next-mdx-remote`, `typescript`, Next `app/` router, API routes, server actions, `next/font`, `next/image`, `next/link`, `next/navigation`, ISR/cache tags.

## Added

- `vite`, `@vitejs/plugin-react`, `react-router-dom`, `react-helmet-async`, `@mdx-js/mdx`, `@mdx-js/react` (runtime MDX for post content).

## Manual follow-ups

1. Add `public/img/hritik.png` (referenced by swipe cards) if it is not already on your CDN.
2. Run `cd back-end && npm run bootstrap` after filling `back-end/.env`.
3. Set `VITE_ADMIN_EMAIL` and create an Appwrite account for that email/password.

## Folder layout

- `src/pages/` — route screens (formerly `src/app/**/page.tsx`).
- `src/components/` — same components as the Next app (`.jsx`).
- `src/lib/` — utilities, posts client, contact client, schemas.
- `src/data/` — JSON and `privacy.md` (privacy is bundled via `?raw`).
