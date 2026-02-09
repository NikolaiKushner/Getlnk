import { define } from "../../../utils.ts";
import { createAdminSupabaseClient } from "../../../lib/supabase.ts";
import {
  constructWebhookEvent,
  getPlanFromPriceId,
} from "../../../lib/stripe.ts";
import type { SubscriptionPlan } from "../../../lib/database.types.ts";

// Helper type for profile query results
interface ProfileRow {
  id: string;
  plan: SubscriptionPlan;
}

// POST /api/billing/webhook - Handle Stripe webhook events
// This endpoint is called by Stripe and must NOT require auth
export const handler = define.handlers({
  async POST(ctx) {
    const signature = ctx.req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let event;
    try {
      const body = await ctx.req.text();
      event = await constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    try {
      switch (event.type) {
        // ============================================
        // Checkout completed - activate subscription
        // ============================================
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata?.supabase_user_id;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          if (!userId) {
            console.error("No supabase_user_id in checkout metadata");
            break;
          }

          // Fetch the subscription to get plan details
          const stripe = (await import("../../../lib/stripe.ts")).getStripe();
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const plan = priceId ? getPlanFromPriceId(priceId) : "pro";

          // Get current plan for audit log
          const { data: currentProfile } = await adminSupabase
            .from("user_profiles")
            .select("plan")
            .eq("id", userId)
            .single() as { data: { plan: SubscriptionPlan } | null };

          const fromPlan = currentProfile?.plan || "free";

          // Update user profile
          await adminSupabase
            .from("user_profiles")
            .update({
              plan,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: "active",
              subscription_period_end: new Date(
                subscription.current_period_end * 1000,
              ).toISOString(),
            } as never)
            .eq("id", userId);

          // Log the event
          await adminSupabase.from("subscription_events").insert({
            user_id: userId,
            event_type: "upgraded",
            from_plan: fromPlan,
            to_plan: plan,
            stripe_event_id: event.id,
            metadata: { checkout_session_id: session.id },
          } as never);

          console.log(`User ${userId} upgraded to ${plan}`);
          break;
        }

        // ============================================
        // Subscription updated (plan change, renewal)
        // ============================================
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const userId = subscription.metadata?.supabase_user_id;

          if (!userId) {
            // Try to find user by customer ID
            const customerId = subscription.customer as string;
            const { data: profile } = await adminSupabase
              .from("user_profiles")
              .select("id, plan")
              .eq("stripe_customer_id", customerId)
              .single() as { data: ProfileRow | null };

            if (!profile) {
              console.error("No user found for customer:", customerId);
              break;
            }

            const priceId = subscription.items.data[0]?.price.id;
            const newPlan = priceId ? getPlanFromPriceId(priceId) : "pro";
            const fromPlan = profile.plan;

            const status = subscription.cancel_at_period_end
              ? "canceled"
              : subscription.status === "active"
              ? "active"
              : subscription.status === "past_due"
              ? "past_due"
              : subscription.status === "trialing"
              ? "trialing"
              : "active";

            await adminSupabase
              .from("user_profiles")
              .update({
                plan: newPlan,
                subscription_status: status,
                subscription_period_end: new Date(
                  subscription.current_period_end * 1000,
                ).toISOString(),
              } as never)
              .eq("id", profile.id);

            // Log plan change if different
            if (fromPlan !== newPlan) {
              const eventType = (
                ["free", "pro", "business"].indexOf(newPlan) >
                  ["free", "pro", "business"].indexOf(fromPlan)
              )
                ? "upgraded"
                : "downgraded";

              await adminSupabase.from("subscription_events").insert({
                user_id: profile.id,
                event_type: eventType,
                from_plan: fromPlan,
                to_plan: newPlan,
                stripe_event_id: event.id,
              } as never);
            }

            break;
          }

          // User ID in metadata
          const priceId = subscription.items.data[0]?.price.id;
          const newPlan = priceId ? getPlanFromPriceId(priceId) : "pro";

          const status = subscription.cancel_at_period_end
            ? "canceled"
            : subscription.status === "active"
            ? "active"
            : subscription.status === "past_due"
            ? "past_due"
            : subscription.status === "trialing"
            ? "trialing"
            : "active";

          await adminSupabase
            .from("user_profiles")
            .update({
              plan: newPlan,
              subscription_status: status,
              subscription_period_end: new Date(
                subscription.current_period_end * 1000,
              ).toISOString(),
            } as never)
            .eq("id", userId);

          console.log(`Subscription updated for ${userId}: ${newPlan} (${status})`);
          break;
        }

        // ============================================
        // Subscription deleted (cancellation effective)
        // ============================================
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const customerId = subscription.customer as string;

          const { data: profile } = await adminSupabase
            .from("user_profiles")
            .select("id, plan")
            .eq("stripe_customer_id", customerId)
            .single() as { data: ProfileRow | null };

          if (!profile) {
            console.error("No user found for customer:", customerId);
            break;
          }

          const fromPlan = profile.plan;

          await adminSupabase
            .from("user_profiles")
            .update({
              plan: "free",
              subscription_status: null,
              stripe_subscription_id: null,
              subscription_period_end: null,
            } as never)
            .eq("id", profile.id);

          await adminSupabase.from("subscription_events").insert({
            user_id: profile.id,
            event_type: "canceled",
            from_plan: fromPlan,
            to_plan: "free",
            stripe_event_id: event.id,
          } as never);

          console.log(`Subscription canceled for user ${profile.id}`);
          break;
        }

        // ============================================
        // Payment failed
        // ============================================
        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const customerId = invoice.customer as string;

          const { data: pfProfile } = await adminSupabase
            .from("user_profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single() as { data: { id: string } | null };

          if (pfProfile) {
            await adminSupabase
              .from("user_profiles")
              .update({ subscription_status: "past_due" } as never)
              .eq("id", pfProfile.id);

            await adminSupabase.from("subscription_events").insert({
              user_id: pfProfile.id,
              event_type: "payment_failed",
              stripe_event_id: event.id,
              metadata: { invoice_id: invoice.id },
            } as never);

            console.log(`Payment failed for user ${pfProfile.id}`);
          }
          break;
        }

        // ============================================
        // Invoice paid (confirms renewal)
        // ============================================
        case "invoice.paid": {
          const invoice = event.data.object;
          const customerId = invoice.customer as string;

          // Only process subscription invoices
          if (!invoice.subscription) break;

          const { data: ipProfile } = await adminSupabase
            .from("user_profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single() as { data: { id: string } | null };

          if (ipProfile) {
            await adminSupabase
              .from("user_profiles")
              .update({ subscription_status: "active" } as never)
              .eq("id", ipProfile.id);

            await adminSupabase.from("subscription_events").insert({
              user_id: ipProfile.id,
              event_type: "renewed",
              stripe_event_id: event.id,
              metadata: { invoice_id: invoice.id },
            } as never);
          }
          break;
        }

        default:
          console.log(`Unhandled webhook event: ${event.type}`);
      }

      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Webhook processing error:", error);
      return new Response(
        JSON.stringify({ error: "Webhook processing failed" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
