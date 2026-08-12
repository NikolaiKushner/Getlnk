# AI Coding Rules

This file defines project-wide rules for AI agents working in this repo.

## Project Overview

**Getlnk** is an open-source link-in-bio platform built with:

- **Runtime:** Node.js on Vercel
- **Framework:** Next.js App Router
- **UI:** React + Tailwind CSS + DaisyUI
- **Auth:** Auth.js (Google OAuth)
- **Database:** Neon Postgres + Drizzle ORM
- **Storage:** Cloudflare R2 (avatars)

## Development Commands

```bash
npm run dev
npm run build
npm run lint
npm run db:push
```

## Architecture

- Pages live in `app/`
- API routes in `app/api/`
- Shared UI in `components/`
- DB schema in `db/schema.ts`
- Auth config in `auth.ts`; helpers in `lib/auth.ts` (`ensureUserProfile`)

## Data Access

- All DB access uses Drizzle via `db` from `@/db`
- Authorization is enforced in server code
- User id is `google_<google-sub>` stored as `user_profiles.id`

## Deferred

- Paddle billing
