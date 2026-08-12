# Security Policy

## Reporting a vulnerability

**Do not report security issues via public GitHub issues.**

- **Email:** security@getlnk.xyz
- **GitHub:** Security → Report a vulnerability

Include: description, repro steps, impact, and a suggested fix if you have one.

**Response:** acknowledgment within 48 hours; assessment within 7 days.

## Practices

- Never commit `.env`, `.env.local`, or other secret files
- Keep `AUTH_SECRET`, Google OAuth secrets, Neon `DATABASE_URL`, and R2 keys only in Vercel / local env
- Enforce auth in API routes and middleware; validate all user input server-side
- Prefer least privilege for cloud credentials (R2 scoped keys, Neon roles)
