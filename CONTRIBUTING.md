# Contributing to Getlnk

Thanks for contributing.

## Bugs

1. Check [Issues](https://github.com/NikolaiKushner/get-lnk/issues) first
2. Open a new issue with steps to reproduce, expected vs actual, and environment

## Pull requests

1. Fork and branch from `main`
2. Follow existing TypeScript / Tailwind patterns
3. Run `npm run lint` and `npm run build`
4. Test locally with `npm run dev`
5. Open a PR

## Setup

See [README.md](./README.md). Copy `.env.example` → `.env.local` (never commit secrets).

## Code style

- TypeScript strict mode
- Use `@/` import alias
- Prefer shared UI from `components/ui/`
- Keep API responses JSON (`{ data }` / `{ error }`)

## Layout

- `app/` — pages and API routes
- `components/` — React UI
- `db/` — Drizzle schema and client
- `lib/` — auth, R2, validators

See [AGENTS.md](./AGENTS.md) for agent conventions.

## License

Contributions are licensed under the MIT License.
