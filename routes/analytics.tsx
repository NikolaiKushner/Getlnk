import { define } from "../utils.ts";
import { Head } from "fresh/runtime";
import { getAuthUser, isSuperAdmin } from "../lib/auth.ts";
import type { AuthUser } from "../lib/auth.ts";
import { getPlanLimits } from "../lib/plans.ts";
import AnalyticsIsland from "../islands/AnalyticsIsland.tsx";
import DashboardNav from "../components/DashboardNav.tsx";

export default define.page(async function Analytics(ctx) {
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
  const planLimits = getPlanLimits(userPlan);

  return (
    <>
      <Head>
        <title>Analytics - Getlnk</title>
      </Head>
      <div class="min-h-screen bg-gray-50">
        <DashboardNav
          activeTab="analytics"
          userName={profile.full_name || user.email || ""}
          isAdmin={isAdmin}
          plan={userPlan}
        />

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AnalyticsIsland
            plan={userPlan}
            analyticsRetentionDays={planLimits.analyticsRetentionDays}
          />
        </main>
      </div>
    </>
  );
});
