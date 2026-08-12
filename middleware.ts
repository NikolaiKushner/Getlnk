import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analytics(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
  "/admin(.*)",
  "/api/links(.*)",
  "/api/public-profile(.*)",
  "/api/profile(.*)",
  "/api/analytics(.*)",
  "/api/settings(.*)",
  "/api/admin(.*)",
]);

const isPublicApi = createRouteMatcher([
  "/api/links/click(.*)",
  "/api/links/redirect(.*)",
  "/api/public-profile/view(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicApi(req)) return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
