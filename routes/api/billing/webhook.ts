import { define } from "../../../utils.ts";
import { createAdminSupabaseClient } from "../../../lib/supabase.ts";
import {
  constructWebhookEvent,
  getPlanFromPriceId,
  getStripe,
} from "../../../lib/stripe.ts";
import type { SubscriptionPlan } from "../../../lib/database.types.ts";

/** Map Stripe subscription status to our internal status. */
function resolveSubscriptionStatus(
  stripeStatus: string,
  cancelAtPeriodEnd: boolean,
): "active" | "canceled" | "past_due" | "trialing" {
  if (cancelAtPeriodEnd) return "canceled";
  if (stripeStatus === "past_due") return "past_due";
  if (stripeStatus === "trialing") return "trialing";
  return "active";
}

/** Look up a user profile by stripe_customer_id. */
async function findProfileByCustomer(
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>,
  customerId: string,
) {
  const { data } = await adminSupabase
    .from("user_profiles")
    .select("id, plan")
    .eq("stripe_customer_id", customerId)
    .single();
  return data;
}

// POST /api/billing/webhook — Stripe webhook handler (no auth required)
export const handler = define.handlers({
  async POST(ctx) {
    const signature = ctx.req.headers.get("stripe-signature");
    if (!signature) {
      return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event;
    try {
      const body = await ctx.req.text();
      event = await constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const db = createAdminSupabaseClient();

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata?.supabase_user_id;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          if (!userId) {
            console.error("Webhook: no supabase_user_id in checkout metadata");
            break;
          }

          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const plan = priceId ? getPlanFromPriceId(priceId) : "pro";

          const { data: current } = await db
            .from("user_profiles")
            .select("plan")
            .eq("id", userId)
            .single();

          const fromPlan = (current?.plan as SubscriptionPlan) || "free";

          const { error } = await db
            .from("user_profiles")
            .update({
              plan,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: "active",
              subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", userId);

          if (error) {
            console.error(`Webhook: failed to update user ${userId}:`, error);
            break;
          }

          await db.from("subscription_events").insert({
            user_id: userId,
            event_type: "upgraded",
            from_plan: fromPlan,
            to_plan: plan,
            stripe_event_id: event.id,
            metadata: { checkout_session_id: session.id },
          });
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const priceId = subscription.items.data[0]?.price.id;
          const newPlan = priceId ? getPlanFromPriceId(priceId) : "pro";
          const status = resolveSubscriptionStatus(subscription.status, subscription.cancel_at_period_end);
          const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          // Find user by metadata or customer ID fallback
          const userId = subscription.metadata?.supabase_user_id;
          const profile = userId
            ? { id: userId, plan: "free" as SubscriptionPlan }
            : await findProfileByCustomer(db, subscription.customer as string);

          if (!profile) {
            console.error("Webhook: no user for customer", subscription.customer);
            break;
          }

          const { error } = await db
            .from("user_profiles")
            .update({ plan: newPlan, subscription_status: status, subscription_period_end: periodEnd })
            .eq("id", profile.id);

          if (error) {
            console.error("Webhook: failed to update subscription:", error);
            break;
          }

          // Log plan changes
          const fromPlan = profile.plan as SubscriptionPlan;
          if (fromPlan !== newPlan) {
            const upgrading = ["free", "pro", "business"].indexOf(newPlan) >
              ["free", "pro", "business"].indexOf(fromPlan);
            await db.from("subscription_events").insert({
              user_id: profile.id,
              event_type: upgrading ? "upgraded" : "downgraded",
              from_plan: fromPlan,
              to_plan: newPlan,
              stripe_event_id: event.id,
            });
          }
          break;
        }

        case "customer.subscription.deleted": {
          const customerId = (event.data.object).customer as string;
          const profile = await findProfileByCustomer(db, customerId);

          if (!profile) {
            console.error("Webhook: no user for customer", customerId);
            break;
          }

          await db
            .from("user_profiles")
            .update({
              plan: "free",
              subscription_status: null,
              stripe_subscription_id: null,
              subscription_period_end: null,
            })
            .eq("id", profile.id);

          await db.from("subscription_events").insert({
            user_id: profile.id,
            event_type: "canceled",
            from_plan: profile.plan,
            to_plan: "free",
            stripe_event_id: event.id,
          });
          break;
        }

        case "invoice.payment_failed": {
          const customerId = (event.data.object).customer as string;
          const profile = await findProfileByCustomer(db, customerId);
          if (!profile) break;

          await db.from("user_profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", profile.id);

          await db.from("subscription_events").insert({
            user_id: profile.id,
            event_type: "payment_failed",
            stripe_event_id: event.id,
            metadata: { invoice_id: (event.data.object).id },
          });
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object;
          if (!invoice.subscription) break;

          const profile = await findProfileByCustomer(db, invoice.customer as string);
          if (!profile) break;

          await db.from("user_profiles")
            .update({ subscription_status: "active" })
            .eq("id", profile.id);

          await db.from("subscription_events").insert({
            user_id: profile.id,
            event_type: "renewed",
            stripe_event_id: event.id,
            metadata: { invoice_id: invoice.id },
          });
          break;
        }

        default:
          // Ignore unhandled event types
          break;
      }

      return Response.json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return Response.json({ error: "Webhook processing failed" }, { status: 500 });
    }
  },
});
