# Getlnk

One link. Every you. — open-source link-in-bio platform.

**Stack:** Next.js (App Router) · Clerk · Neon · Drizzle · Vercel · Cloudflare DNS

## Development

```bash
npm install
vercel env pull .env.local   # if linked
npm run dev
```

Required env (see `.env.example`):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `DATABASE_URL` (Neon)

## Database

Schema lives in `db/schema.ts`. Apply with:

```bash
npm run db:push
```

SQL reference: `sql/NEON_SETUP.sql`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:push
```

## Product routes

- `/` landing
- `/sign-in`, `/sign-up` (Clerk)
- `/onboarding` claim username
- `/dashboard` links + profile editor
- `/analytics`, `/settings`, `/admin`
- `/@username` public profile (rewrite → `/u/[username]`)

## Deferred

- Avatar uploads via Cloudflare R2
- Paddle billing
