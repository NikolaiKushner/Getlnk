import { define } from "../utils.ts";
import { getAuthUser } from "../lib/auth.ts";
import { applyRateLimit } from "../lib/rate-limit.ts";

export default define.middleware(async (ctx) => {
  const url = new URL(ctx.req.url);

  // Rate limit API routes (skip Stripe webhook — it has its own signature verification)
  if (url.pathname.startsWith("/api/") && url.pathname !== "/api/billing/webhook") {
    const result = applyRateLimit(ctx.req);
    if ("response" in result) {
      return result.response;
    }
    // Store rate limit headers to add to the response later
    ctx.state.rateLimitHeaders = result.headers;
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/auth/callback",
    "/forgot-password",
    "/reset-password",
    "/privacy",
    "/terms",
    "/api/auth/session",
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) =>
    url.pathname === route || url.pathname.startsWith("/api/auth/")
  ) || url.pathname.startsWith("/@") || // Dynamic route: /@[username]
    url.pathname.startsWith("/api/links/redirect/") || // Redirect endpoint link: /api/links/redirect/:id
    url.pathname === "/api/billing/webhook" || // Stripe webhook (uses signature verification, not auth)
    url.pathname === "/pricing"; // Public pricing page

  // Static files and assets
  const isStaticFile = url.pathname.startsWith("/static/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.match(/\.(ico|svg|png|jpg|jpeg|gif|css|js)$/);

  if (isStaticFile) {
    return ctx.next();
  }

  // Get authenticated user
  const authUser = await getAuthUser(ctx.req);

  // Store auth user in context state
  ctx.state.authUser = authUser || undefined;

  // Redirect to login if accessing protected route without auth
  if (!isPublicRoute && !authUser) {
    return new Response("", {
      status: 302,
      headers: {
        Location: `/login?redirect=${encodeURIComponent(url.pathname)}`,
      },
    });
  }

  // Redirect authenticated users away from auth pages
  if (authUser && (url.pathname === "/login" || url.pathname === "/register")) {
    return new Response("", {
      status: 302,
      headers: { Location: "/dashboard" },
    });
  }

  const response = await ctx.next();

  // Add rate limit headers to API responses
  const rlHeaders = ctx.state.rateLimitHeaders;
  if (rlHeaders) {
    for (const [key, value] of Object.entries(rlHeaders)) {
      response.headers.set(key, value);
    }
  }

  return response;
});
