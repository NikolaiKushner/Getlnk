# Cloudflare DNS cutover for getlnk.xyz

Production is live at https://getlnk.vercel.app

Domains `getlnk.xyz` and `www.getlnk.xyz` are attached to the Vercel project
`getlnk`, but DNS still points at the old Deno Deploy / Cloudflare proxy.

## Recommended Cloudflare records (keep nameservers on Cloudflare)

In Cloudflare DNS for `getlnk.xyz`:

1. **Root (`@`)**
   - Type: `CNAME` (or ANAME/flattened CNAME if offered)
   - Name: `@`
   - Target: `7c2fdee445c876a0.vercel-dns-017.com`
   - Proxy: **DNS only** (grey cloud) while verifying, then can re-enable proxy
     with SSL mode **Full (strict)**

   Alternative A record from Vercel:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`

2. **www**
   - Type: `CNAME`
   - Name: `www`
   - Target: `7c2fdee445c876a0.vercel-dns-017.com`
   - Proxy: DNS only initially

Or use Vercel Domain Connect (opens Cloudflare with the correct records):

- https://vercel.com/api/v9/projects/prj_yEaWGcjv1fRh3qAYs7A3z4cfg2yb/domains/getlnk.xyz/domain-connect/apply?teamId=team_vIXLTAJR4iKnLoPGG9viXqPB
- https://vercel.com/api/v9/projects/prj_yEaWGcjv1fRh3qAYs7A3z4cfg2yb/domains/www.getlnk.xyz/domain-connect/apply?teamId=team_vIXLTAJR4iKnLoPGG9viXqPB

After DNS updates:

```bash
vercel domains verify getlnk.xyz
vercel domains verify www.getlnk.xyz
```

## Clerk

In Clerk Dashboard (development for now), add allowed origins / redirect URLs:

- `https://getlnk.vercel.app`
- `https://getlnk.xyz`
- `https://www.getlnk.xyz`

When ready for true production keys, run Clerk production deploy and pull
prod env into Vercel.
