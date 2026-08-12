# AI Coding Rules

This file defines project-wide rules for AI agents working in this repo.

## Project Overview

**Getlnk** is an open-source link-in-bio platform built with:

- **Runtime:** Node.js on Vercel
- **Framework:** Next.js App Router
- **UI:** React + Tailwind CSS + DaisyUI
- **Auth:** Clerk
- **Database:** Neon Postgres + Drizzle ORM

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
- Auth helpers in `lib/auth.ts` (`ensureUserProfile`, `requireAuth`)

## Data Access

- All DB access uses Drizzle via `db` from `@/db`
- Authorization is enforced in server code (no Postgres RLS)
- Clerk user id is the `user_profiles.id` primary key (text)

## Deferred

- Avatars: Cloudflare R2 (credentials provided later)
- Billing: Paddle

Legacy Deno/Fresh sources are archived under `_legacy/` for reference only
and are excluded from TypeScript.
