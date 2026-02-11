import { define } from "../utils.ts";
import { Head } from "fresh/runtime";
import { getAuthUser } from "../lib/auth.ts";
import type { AuthUser } from "../lib/auth.ts";
import PricingIsland from "../islands/PricingIsland.tsx";

export default define.page(async function Pricing(ctx) {
  const authUser = await getAuthUser(ctx.req) as AuthUser | null;
  const isAuthenticated = !!authUser;
  const currentPlan = authUser?.profile?.plan || "free";
  const paddleEnv = Deno.env.get("PADDLE_ENVIRONMENT") || "sandbox";
  const paddleSellerId = Deno.env.get("PADDLE_SELLER_ID") || "";

  return (
    <>
      <Head>
        <title>Pricing - Getlnk</title>
        <meta
          name="description"
          content="Simple, transparent pricing for Getlnk. Start free, upgrade when you need more."
        />
        <script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
      </Head>
      <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header class="bg-white/80 backdrop-blur-sm shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <a href="/" class="flex items-center gap-2">
                  <img
                    src="/logo.svg"
                    width="40"
                    height="40"
                    alt="Getlnk logo"
                  />
                  <span class="text-lg sm:text-xl font-bold text-gray-900">
                    Getlnk
                  </span>
                </a>
              </div>
              <div class="flex gap-2 sm:gap-3">
                {isAuthenticated
                  ? (
                    <a
                      href="/dashboard"
                      class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium touch-manipulation"
                    >
                      Dashboard
                    </a>
                  )
                  : (
                    <>
                      <a
                        href="/login"
                        class="inline-flex items-center justify-center px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium touch-manipulation"
                      >
                        Login
                      </a>
                      <a
                        href="/register"
                        class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium touch-manipulation"
                      >
                        Sign Up
                      </a>
                    </>
                  )}
              </div>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div class="text-center mb-4">
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
              Simple, transparent pricing
            </h1>
            <p class="mt-4 text-lg text-gray-600 max-w-lg mx-auto">
              Start free. Upgrade when you need more. No surprises.
            </p>
          </div>

          <PricingIsland
            currentPlan={currentPlan}
            isAuthenticated={isAuthenticated}
            paddleEnv={paddleEnv}
            paddleSellerId={paddleSellerId}
          />
        </main>
      </div>
    </>
  );
});
