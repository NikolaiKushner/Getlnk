import { define } from "../../../utils.ts";
import { getSession, getUserProfile } from "../../../lib/auth.ts";
import { createSupabaseClient } from "../../../lib/supabase.ts";
import {
  createCheckoutSession,
  getOrCreateStripeCustomer,
  getStripePriceIds,
} from "../../../lib/stripe.ts";
import { isValidPlan } from "../../../lib/plans.ts";
import type { SubscriptionPlan } from "../../../lib/database.types.ts";

// POST /api/billing/checkout - Create a Stripe Checkout Session
export const handler = define.handlers({
  async POST(ctx) {
    try {
      const session = await getSession(ctx.req);
      if (!session) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }

      const body = await ctx.req.json();
      const { plan, interval = "monthly" } = body as {
        plan: string;
        interval?: "monthly" | "yearly";
      };

      // Validate plan
      if (!plan || !isValidPlan(plan) || plan === "free") {
        return new Response(
          JSON.stringify({ error: "Invalid plan. Choose 'pro' or 'business'." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Validate interval
      if (interval !== "monthly" && interval !== "yearly") {
        return new Response(
          JSON.stringify({ error: "Invalid interval. Choose 'monthly' or 'yearly'." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Get Stripe price ID
      const priceIds = getStripePriceIds(plan as SubscriptionPlan);
      if (!priceIds) {
        return new Response(
          JSON.stringify({ error: "No pricing configured for this plan" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const priceId = interval === "yearly" ? priceIds.yearly : priceIds.monthly;
      if (!priceId) {
        return new Response(
          JSON.stringify({ error: `No ${interval} price configured for ${plan} plan` }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Get user profile
      const profile = await getUserProfile(session.user.id, session.accessToken);
      if (!profile) {
        return new Response(
          JSON.stringify({ error: "User profile not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      // Get or create Stripe customer
      const customerId = await getOrCreateStripeCustomer(
        session.user.id,
        session.user.email || "",
        profile.stripe_customer_id,
      );

      // Save customer ID if it's new
      if (!profile.stripe_customer_id || profile.stripe_customer_id !== customerId) {
        const supabase = createSupabaseClient(session.accessToken);
        await supabase
          .from("user_profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", session.user.id);
      }

      // Create checkout session
      const origin = new URL(ctx.req.url).origin;
      const checkoutSession = await createCheckoutSession({
        customerId,
        priceId,
        userId: session.user.id,
        successUrl: `${origin}/dashboard/billing?success=true`,
        cancelUrl: `${origin}/pricing?canceled=true`,
      });

      return new Response(
        JSON.stringify({ url: checkoutSession.url }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Checkout error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Failed to create checkout session",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
