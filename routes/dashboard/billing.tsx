import { define } from "../../utils.ts";
import { Head } from "fresh/runtime";
import { getAuthUser, isSuperAdmin } from "../../lib/auth.ts";
import type { AuthUser } from "../../lib/auth.ts";
import DashboardNav from "../../components/DashboardNav.tsx";
import BillingIsland from "../../islands/BillingIsland.tsx";

export default define.page(async function Billing(ctx) {
  const authUser = await getAuthUser(ctx.req) as AuthUser | null;

  if (!authUser) {
    return new Response("", {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  const { user, profile } = authUser;
  const isAdmin = isSuperAdmin(profile);
  const userPlan = profile.plan || "free";

  return (
    <>
      <Head>
        <title>Billing - Getlnk</title>
      </Head>
      <div class="min-h-screen bg-gray-50">
        <DashboardNav
          activeTab="billing"
          userName={profile.full_name || user.email || ""}
          isAdmin={isAdmin}
          plan={userPlan}
        />

        <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Billing</h1>
            <p class="text-sm text-gray-600 mt-1">
              Manage your subscription and billing details.
            </p>
          </div>

          <BillingIsland
            plan={userPlan}
            subscriptionStatus={profile.subscription_status}
            subscriptionPeriodEnd={profile.subscription_period_end}
          />
        </main>
      </div>
    </>
  );
});
