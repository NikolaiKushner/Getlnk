import { define } from "../../../utils.ts";
import { getSession, getUserProfile } from "../../../lib/auth.ts";
import { getPlanLimits, PLAN_INFO } from "../../../lib/plans.ts";

// GET /api/billing/status - Get current user's billing status
export const handler = define.handlers({
  async GET(ctx) {
    try {
      const session = await getSession(ctx.req);
      if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const profile = await getUserProfile(session.user.id, session.accessToken);
      if (!profile) {
        return Response.json({ error: "Profile not found" }, { status: 404 });
      }

      const plan = profile.plan || "free";
      const limits = getPlanLimits(plan);
      const planInfo = PLAN_INFO.find((p) => p.id === plan);

      return Response.json({
        plan,
        planName: planInfo?.name || "Free",
        subscriptionStatus: profile.subscription_status,
        subscriptionPeriodEnd: profile.subscription_period_end,
        trialEndsAt: profile.trial_ends_at,
        hasSubscription: !!profile.paddle_subscription_id,
        limits,
      });
    } catch (error) {
      console.error("Billing status error:", error);
      return Response.json(
        { error: error instanceof Error ? error.message : "Failed to get billing status" },
        { status: 500 },
      );
    }
  },
});
