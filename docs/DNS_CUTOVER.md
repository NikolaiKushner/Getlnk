# Cloudflare DNS cutover for getlnk.xyz

Production: https://getlnk.xyz (Vercel)

## Auth.js Google redirects

In Google Cloud Console → OAuth client, add:

- `http://localhost:3000/api/auth/callback/google`
- `https://getlnk.xyz/api/auth/callback/google`
- `https://getlnk.vercel.app/api/auth/callback/google`

Set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` in `.env.local` and Vercel.
