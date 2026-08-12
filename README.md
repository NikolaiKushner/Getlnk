# Getlnk

One link for everything you share. Open-source link-in-bio at [getlnk.xyz](https://getlnk.xyz).

**Stack:** Next.js (App Router) · Auth.js (Google) · Neon Postgres · Drizzle · Vercel · Cloudflare R2

## Features

- Google sign-in
- Username claim + public page (`/u/[username]`)
- Link CRUD, reorder, click tracking
- Avatar upload to R2
- Analytics dashboard
- Admin user list (superadmin role)

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in values
# or: vercel link && vercel env pull .env.local

npm run db:push              # apply schema to Neon
npm run dev                  # http://localhost:3000
```

### Environment

See `.env.example`. Required:

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client |
| `AUTH_URL` | Canonical site URL (e.g. `https://getlnk.xyz`) |
| `DATABASE_URL` | Neon connection string |
| `R2_*` | Cloudflare R2 for avatars |

Google OAuth redirect URIs:

- `http://localhost:3000/api/auth/callback/google`
- `https://getlnk.xyz/api/auth/callback/google`
- `https://getlnk.vercel.app/api/auth/callback/google`

### Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:push
npm run db:studio
```

## Project layout

```
app/           # App Router pages + API routes
components/    # UI (shared + feature islands)
db/            # Drizzle client + schema
lib/           # Auth helpers, R2, validators
sql/           # Reference SQL (NEON_SETUP.sql)
auth.ts        # Auth.js config
middleware.ts  # Route protection
```

## Database

Schema lives in `db/schema.ts`. Reference SQL: `sql/NEON_SETUP.sql`.

User ids are `google_<sub>` (Auth.js). Apply with `npm run db:push` or run the SQL in the Neon console.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Agent conventions: [AGENTS.md](./AGENTS.md).

## License

MIT — see [LICENSE](./LICENSE).
