import { define } from "../../../utils.ts";
import { getSession, getUserProfile } from "../../../lib/auth.ts";
import { createPortalSession } from "../../../lib/paddle.ts";

// POST /api/billing/portal - Get Paddle customer portal URL
export const handler = define.handlers({
  async POST(ctx) {
    try {
      const session = await getSession(ctx.req);
      if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const profile = await getUserProfile(session.user.id, session.accessToken);

      if (!profile?.paddle_customer_id) {
        return Response.json(
          { error: "No active subscription found. Please subscribe to a plan first." },
          { status: 400 },
        );
      }

      // Create an authenticated portal session for this customer
      const portalUrl = await createPortalSession(profile.paddle_customer_id);
      if (!portalUrl) {
        return Response.json(
          { error: "Unable to create portal session" },
          { status: 500 },
        );
      }

      return Response.json({ url: portalUrl });
    } catch (error) {
      console.error("Portal error:", error);
      return Response.json(
        { error: error instanceof Error ? error.message : "Failed to create portal session" },
        { status: 500 },
      );
    }
  },
});
