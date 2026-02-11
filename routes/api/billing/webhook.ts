import { define } from "../../../utils.ts";
import { createAdminSupabaseClient } from "../../../lib/supabase.ts";
import {
  getPlanFromPriceId,
  mapPaddleStatus,
  verifyWebhookSignature,
} from "../../../lib/paddle.ts";
import type { SubscriptionPlan } from "../../../lib/database.types.ts";

/** Look up a user profile by paddle_subscription_id. */
async function findProfileBySubscription(
  adminSupabase: ReturnType<typeof createAdminSupabaseClient>,
  subscriptionId: string,
) {
  const { data } = await adminSupabase
    .from("user_profiles")
    .select("id, plan")
    .eq("paddle_subscription_id", subscriptionId)
    .single();
  return data;
}

// POST /api/billing/webhook — Paddle webhook handler (no auth required)
export const handler = define.handlers({
  async POST(ctx) {
    const signature = ctx.req.headers.get("paddle-signature");
    if (!signature) {
      return Response.json({ error: "Missing Paddle-Signature header" }, { status: 400 });
    }

    const body = await ctx.req.text();

    const isValid = await verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error("Webhook signature verification failed");
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(body);
    const eventType = payload.event_type;
    const data = payload.data;
    const db = createAdminSupabaseClient();

    try {
      switch (eventType) {
        case "subscription.created": {
          // User ID comes from custom_data set during checkout
          const userId = data?.custom_data?.user_id;
          if (!userId) {
            console.error("Webhook: no user_id in subscription.created custom_data");
            break;
          }

          const subscriptionId = data?.id;
          const customerId = data?.customer_id;
          const priceId = data?.items?.[0]?.price?.id;
          const plan = priceId ? getPlanFromPriceId(priceId) : "pro";
          const status = mapPaddleStatus(data?.status || "active");
          const periodEnd = data?.current_billing_period?.ends_at ||
            data?.next_billed_at;
          const managementUrls = data?.management_urls;

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
              paddle_customer_id: customerId,
              paddle_subscription_id: subscriptionId,
              subscription_status: status,
              subscription_period_end: periodEnd
                ? new Date(periodEnd).toISOString()
                : null,
              paddle_portal_url: managementUrls?.cancel || null,
              paddle_update_payment_url:
                managementUrls?.update_payment_method || null,
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
            paddle_event_id: payload.event_id || "",
            metadata: { subscription_id: subscriptionId },
          });
          break;
        }

        case "subscription.updated": {
          const subscriptionId = data?.id;
          const priceId = data?.items?.[0]?.price?.id;
          const newPlan = priceId ? getPlanFromPriceId(priceId) : "pro";
          const status = mapPaddleStatus(data?.status || "active");
          const periodEnd = data?.current_billing_period?.ends_at ||
            data?.next_billed_at;
          const managementUrls = data?.management_urls;

          // Try custom_data first, then look up by subscription ID
          const userId = data?.custom_data?.user_id;
          const profile = userId
            ? { id: userId, plan: "free" as SubscriptionPlan }
            : await findProfileBySubscription(db, subscriptionId);

          if (!profile) {
            console.error(
              "Webhook: no user for subscription",
              subscriptionId,
            );
            break;
          }

          const { error } = await db
            .from("user_profiles")
            .update({
              plan: newPlan,
              subscription_status: status,
              subscription_period_end: periodEnd
                ? new Date(periodEnd).toISOString()
                : null,
              paddle_portal_url: managementUrls?.cancel || null,
              paddle_update_payment_url:
                managementUrls?.update_payment_method || null,
            })
            .eq("id", profile.id);

          if (error) {
            console.error("Webhook: failed to update subscription:", error);
            break;
          }

          // Log plan changes
          const fromPlan = profile.plan as SubscriptionPlan;
          if (fromPlan !== newPlan) {
            const planOrder = ["free", "pro", "business"];
            const upgrading = planOrder.indexOf(newPlan) >
              planOrder.indexOf(fromPlan);
            await db.from("subscription_events").insert({
              user_id: profile.id,
              event_type: upgrading ? "upgraded" : "downgraded",
              from_plan: fromPlan,
              to_plan: newPlan,
              paddle_event_id: payload.event_id || "",
            });
          }
          break;
        }

        case "subscription.canceled": {
          const subscriptionId = data?.id;
          const profile = await findProfileBySubscription(db, subscriptionId);

          if (!profile) {
            console.error(
              "Webhook: no user for subscription",
              subscriptionId,
            );
            break;
          }

          // Paddle fires canceled when subscription is actually ended — reset to free
          await db
            .from("user_profiles")
            .update({
              plan: "free",
              subscription_status: "canceled",
              paddle_subscription_id: null,
              subscription_period_end: null,
              paddle_portal_url: null,
              paddle_update_payment_url: null,
            })
            .eq("id", profile.id);

          await db.from("subscription_events").insert({
            user_id: profile.id,
            event_type: "canceled",
            from_plan: profile.plan,
            to_plan: "free",
            paddle_event_id: payload.event_id || "",
          });
          break;
        }

        case "subscription.past_due": {
          const subscriptionId = data?.id;
          const profile = await findProfileBySubscription(db, subscriptionId);
          if (!profile) break;

          await db.from("user_profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", profile.id);

          await db.from("subscription_events").insert({
            user_id: profile.id,
            event_type: "payment_failed",
            paddle_event_id: payload.event_id || "",
          });
          break;
        }

        case "subscription.paused": {
          const subscriptionId = data?.id;
          const profile = await findProfileBySubscription(db, subscriptionId);
          if (!profile) break;

          await db.from("user_profiles")
            .update({ subscription_status: "canceled" })
            .eq("id", profile.id);

          await db.from("subscription_events").insert({
            user_id: profile.id,
            event_type: "paused",
            paddle_event_id: payload.event_id || "",
          });
          break;
        }

        case "subscription.resumed": {
          const subscriptionId = data?.id;
          const profile = await findProfileBySubscription(db, subscriptionId);
          if (!profile) break;

          await db.from("user_profiles")
            .update({ subscription_status: "active" })
            .eq("id", profile.id);

          await db.from("subscription_events").insert({
            user_id: profile.id,
            event_type: "resumed",
            paddle_event_id: payload.event_id || "",
          });
          break;
        }

        case "transaction.payment_failed": {
          // Transaction-level payment failure
          const subscriptionId = data?.subscription_id;
          if (!subscriptionId) break;

          const profile = await findProfileBySubscription(db, subscriptionId);
          if (!profile) break;

          await db.from("user_profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", profile.id);

          await db.from("subscription_events").insert({
            user_id: profile.id,
            event_type: "payment_failed",
            paddle_event_id: payload.event_id || "",
            metadata: { transaction_id: data?.id },
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
      return Response.json(
        { error: "Webhook processing failed" },
        { status: 500 },
      );
    }
  },
});
