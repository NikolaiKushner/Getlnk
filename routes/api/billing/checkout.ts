import { define } from "../../../utils.ts";
import { getSession, getUserProfile } from "../../../lib/auth.ts";
import {
  createPaddleCheckout,
  getPriceIds,
} from "../../../lib/paddle.ts";
import { isValidPlan } from "../../../lib/plans.ts";
import type { SubscriptionPlan } from "../../../lib/database.types.ts";

// POST /api/billing/checkout - Create a Paddle Checkout transaction
export const handler = define.handlers({
  async POST(ctx) {
    try {
      const session = await getSession(ctx.req);
      if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await ctx.req.json();
      const { plan, interval = "monthly" } = body as {
        plan: string;
        interval?: "monthly" | "yearly";
      };

      // Validate plan
      if (!plan || !isValidPlan(plan) || plan === "free") {
        return Response.json(
          { error: "Invalid plan. Choose 'pro' or 'business'." },
          { status: 400 },
        );
      }

      // Validate interval
      if (interval !== "monthly" && interval !== "yearly") {
        return Response.json(
          { error: "Invalid interval. Choose 'monthly' or 'yearly'." },
          { status: 400 },
        );
      }

      // Get Paddle price ID
      const priceIds = getPriceIds(plan as SubscriptionPlan);
      if (!priceIds) {
        return Response.json(
          { error: "No pricing configured for this plan" },
          { status: 400 },
        );
      }

      const priceId = interval === "yearly" ? priceIds.yearly : priceIds.monthly;
      if (!priceId) {
        return Response.json(
          { error: `No ${interval} price configured for ${plan} plan` },
          { status: 400 },
        );
      }

      // Get user profile
      const profile = await getUserProfile(session.user.id, session.accessToken);
      if (!profile) {
        return Response.json({ error: "User profile not found" }, { status: 404 });
      }

      // Create Paddle transaction for checkout overlay
      const origin = new URL(ctx.req.url).origin;
      const transactionId = await createPaddleCheckout({
        priceId,
        userId: session.user.id,
        userEmail: session.user.email || "",
        successUrl: `${origin}/dashboard/billing?success=true`,
      });

      return Response.json({ transactionId });
    } catch (error) {
      console.error("Checkout error:", error);
      return Response.json(
        { error: error instanceof Error ? error.message : "Failed to create checkout" },
        { status: 500 },
      );
    }
  },
});
