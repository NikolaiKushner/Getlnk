import { define } from "../../../utils.ts";
import { getSession, getUserProfile } from "../../../lib/auth.ts";
import { getPlanLimits, PLAN_INFO } from "../../../lib/plans.ts";
import { getStripePublishableKey } from "../../../lib/stripe.ts";

// GET /api/billing/status - Get current user's billing status
export const handler = define.handlers({
  async GET(ctx) {
    try {
      const session = await getSession(ctx.req);
      if (!session) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }

      const profile = await getUserProfile(session.user.id, session.accessToken);
      if (!profile) {
        return new Response(
          JSON.stringify({ error: "Profile not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      const plan = profile.plan || "free";
      const limits = getPlanLimits(plan);
      const planInfo = PLAN_INFO.find((p) => p.id === plan);

      // Get publishable key for client-side (safe to expose)
      let publishableKey = "";
      try {
        publishableKey = getStripePublishableKey();
      } catch {
        // Stripe not configured, that's fine
      }

      return new Response(
        JSON.stringify({
          plan,
          planName: planInfo?.name || "Free",
          subscriptionStatus: profile.subscription_status,
          subscriptionPeriodEnd: profile.subscription_period_end,
          trialEndsAt: profile.trial_ends_at,
          hasStripeCustomer: !!profile.stripe_customer_id,
          limits,
          stripePublishableKey: publishableKey,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Billing status error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Failed to get billing status",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
