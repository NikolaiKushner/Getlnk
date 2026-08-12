# Getlnk

One link. Every you. — open-source link-in-bio platform.

**Stack:** Next.js (App Router) · Auth.js (Google) · Neon · Drizzle · Vercel · Cloudflare R2

## Development

```bash
npm install
vercel env pull .env.local   # if linked
npm run dev
```

Required env (see `.env.example`):

- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `DATABASE_URL` (Neon)
- R2 vars for avatars

Google OAuth redirect URIs:

- `http://localhost:3000/api/auth/callback/google`
- `https://getlnk.xyz/api/auth/callback/google`
- `https://getlnk.vercel.app/api/auth/callback/google`

## Database

```bash
npm run db:push
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
