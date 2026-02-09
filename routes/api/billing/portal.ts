import { define } from "../../../utils.ts";
import { getSession, getUserProfile } from "../../../lib/auth.ts";
import { createPortalSession } from "../../../lib/stripe.ts";

// POST /api/billing/portal - Create a Stripe Customer Portal session
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

      const profile = await getUserProfile(session.user.id, session.accessToken);
      if (!profile?.stripe_customer_id) {
        return new Response(
          JSON.stringify({
            error: "No billing account found. Please subscribe to a plan first.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const origin = new URL(ctx.req.url).origin;
      const portalSession = await createPortalSession(
        profile.stripe_customer_id,
        `${origin}/dashboard/billing`,
      );

      return new Response(
        JSON.stringify({ url: portalSession.url }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Portal error:", error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error
            ? error.message
            : "Failed to create portal session",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
