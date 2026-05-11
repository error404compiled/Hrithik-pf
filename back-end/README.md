# Appwrite Backend (Scaffold)

This folder is a persistent backend scaffold for Appwrite integration.

## Included

- `functions/contact`:
  - Stores contact submissions in Appwrite Database.
  - Optionally sends an email notification through Resend.
- `functions/views`:
  - Upserts and increments blog post views in Appwrite Database.
- `functions/chat`:
  - Portfolio support chatbot (Google Gemini `generateContent`, default `gemini-2.5-flash-lite` via `GOOGLE_API_KEY`).
  - Bundles `chatbot-knowledge.json` next to the handler; keep it in sync with `migrated-frontend/src/data/chatbot-knowledge.json` when you edit knowledge.

## Expected Collections

- Database: `portfolio`
- Collection: `contact_submissions`
  - fields: `name` (string), `email` (string), `message` (string), `createdAt` (datetime/string)
- Collection: `post_views`
  - fields: `slug` (string, unique), `views` (integer), `updatedAt` (datetime/string)
- Collection: `posts`
  - fields: `slug`, `title`, `summary`, `image`, `content`, `tags`, `coAuthors`, `readingTime`, `draft`, `publishedAt`, `updatedAt`, `views`

## Environment

Copy `back-end/.env.example` to `back-end/.env` and fill values after creating your Appwrite project.

## Auto-create Database and Collections

Once `.env` is filled, run:

```bash
cd back-end
npm install
npm run bootstrap
```

This creates (or reuses) database/collections/attributes/indexes:

- Database: `portfolio`
- Collection: `contact_submissions`
  - `name`, `email`, `message`, `createdAt`
- Collection: `post_views`
  - `slug` (unique), `views`, `updatedAt`
- Collection: `posts`
  - `slug` (unique), `title`, `summary`, `image`, `content`, `tags`, `coAuthors`, `readingTime`, `draft`, `publishedAt`, `updatedAt`, `views`

## Deploy Notes

These handlers are written for Appwrite Functions (Node runtime). Use Appwrite Console/CLI to:

1. Create functions (`contact`, `views`, `chat`).
2. Upload corresponding source folders.
3. Set function-level environment variables.
4. Configure execute permissions for your frontend origin.

## Frontend Integration

Frontend reads:

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_DATABASE_ID`
- `VITE_APPWRITE_POSTS_COLLECTION_ID`
- `VITE_ADMIN_EMAIL`
- `VITE_APPWRITE_CONTACT_URL`
- `VITE_APPWRITE_VIEWS_URL`
- `VITE_APPWRITE_CHAT_URL` (HTTPS URL of the deployed `chat` function)

Admin blog editor route:

- `/update-vlog` (not linked in navigation)
- only account with `VITE_ADMIN_EMAIL` can create/update posts.
